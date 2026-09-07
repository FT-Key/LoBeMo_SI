import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateBody } from "@/lib/api-validate"
import { createTareaSchema } from "@/shared/validation"
import { withRole, ROLES, Rol } from "@/lib/api-auth"
import { createTransporter, getLogoAttachment, tareaAsignada } from "@/lib/email-templates"

export const GET = withRole(ROLES.MANAGE_PROYECTOS, async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
    const proyectoId = searchParams.get("proyectoId") ?? ""
    const asignacionId = searchParams.get("asignacionId") ?? ""
    const estado = searchParams.get("estado") ?? ""
    const prioridad = searchParams.get("prioridad") ?? ""

    const where: Record<string, unknown> = {}
    if (proyectoId) where.proyectoId = proyectoId
    if (asignacionId) where.asignacionId = asignacionId
    if (estado) where.estado = estado
    if (prioridad) where.prioridad = prioridad

    const [tareas, total] = await Promise.all([
      prisma.tarea.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          asignacion: {
            include: {
              empleado: { select: { id: true, nombre: true, apellido: true, rol: true } },
            },
          },
          proyecto: { select: { id: true, nombre: true } },
        },
      }),
      prisma.tarea.count({ where }),
    ])

    return NextResponse.json({
      data: tareas,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error listing tareas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

export const POST = withRole(ROLES.MANAGE_PROYECTOS, async (request, _ctx, session) => {
  try {
    const body = await request.json()
    const result = validateBody(createTareaSchema, body)
    if (!result.success) return result.error

    const proyecto = await prisma.proyecto.findUnique({ where: { id: result.data.proyectoId } })
    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    const esCisoOGerente = ROLES.MANAGE_PROYECTOS.includes(session.user.rol as Rol)

    if (!esCisoOGerente) {
      const asignacion = await prisma.asignacion.findFirst({
        where: {
          proyectoId: result.data.proyectoId,
          empleadoId: session.user.id,
        },
      })

      if (!asignacion) {
        return NextResponse.json(
          { error: "Solo empleados asignados al proyecto pueden crear tareas (RF-30)" },
          { status: 403 }
        )
      }

      const tarea = await prisma.tarea.create({
        data: {
          proyectoId: result.data.proyectoId,
          titulo: result.data.titulo.trim(),
          descripcion: result.data.descripcion?.trim() || null,
          prioridad: result.data.prioridad,
          fechaLimite: result.data.fechaLimite ? new Date(result.data.fechaLimite) : null,
          asignacionId: asignacion.id,
        },
        include: {
          asignacion: {
            include: {
              empleado: { select: { id: true, nombre: true, apellido: true, rol: true } },
            },
          },
        },
      })

      await prisma.auditLog.create({
        data: {
          accion: "CREATE",
          entidad: "Tarea",
          entidadId: tarea.id,
          detalle: { proyectoId: result.data.proyectoId, titulo: tarea.titulo, prioridad: result.data.prioridad },
          empleadoId: session.user.id,
        },
      })

      return NextResponse.json(tarea, { status: 201 })
    }

    const tarea = await prisma.tarea.create({
      data: {
        proyectoId: result.data.proyectoId,
        titulo: result.data.titulo.trim(),
        descripcion: result.data.descripcion?.trim() || null,
        prioridad: result.data.prioridad,
        fechaLimite: result.data.fechaLimite ? new Date(result.data.fechaLimite) : null,
      },
      include: {
        asignacion: {
          include: {
            empleado: { select: { id: true, nombre: true, apellido: true, rol: true } },
          },
        },
      },
    })

    if (result.data.asignacionId) {
      try {
        const asignacion = await prisma.asignacion.findUnique({
          where: { id: result.data.asignacionId },
          include: { empleado: { select: { nombre: true, apellido: true, email: true } } },
        })
        const transport = createTransporter()
        if (transport && asignacion?.empleado.email) {
          const logoAttachment = await getLogoAttachment()
          const logoCid = logoAttachment.length > 0 ? logoAttachment[0].cid : ""
          const proyecto = await prisma.proyecto.findUnique({ where: { id: result.data.proyectoId }, select: { nombre: true } })

          await transport.sendMail({
            from: `"LoBeMo Seguridad" <${process.env.SMTP_USER}>`,
            to: asignacion.empleado.email,
            subject: `Nueva tarea asignada - ${proyecto?.nombre || "Proyecto"}`,
            html: tareaAsignada({
              nombreEmpleado: `${asignacion.empleado.nombre} ${asignacion.empleado.apellido}`,
              tituloTarea: tarea.titulo,
              nombreProyecto: proyecto?.nombre || "Proyecto",
              prioridad: result.data.prioridad,
              fechaLimite: result.data.fechaLimite || undefined,
              logoCid,
            }),
            attachments: logoAttachment,
          })
        }
      } catch (emailError) {
        console.error("Error sending task assignment email:", emailError)
      }
    }

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "Tarea",
        entidadId: tarea.id,
        detalle: { proyectoId: result.data.proyectoId, titulo: tarea.titulo, prioridad: result.data.prioridad },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(tarea, { status: 201 })
  } catch (error) {
    console.error("Error creating tarea:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
