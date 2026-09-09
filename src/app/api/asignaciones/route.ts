import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateBody } from "@/lib/api-validate"
import { createAsignacionSchema } from "@/shared/validation"
import { withRole, ROLES, Rol } from "@/lib/api-auth"
import { createTransporter, getLogoAttachment, asignacionProyecto, resolverDestinatario } from "@/lib/email-templates"
import { logger } from "@/lib/logger"

export const GET = withRole(ROLES.MANAGE_PROYECTOS, async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
    const proyectoId = searchParams.get("proyectoId") ?? ""
    const empleadoId = searchParams.get("empleadoId") ?? ""

    const where: Record<string, unknown> = {}
    if (proyectoId) where.proyectoId = proyectoId
    if (empleadoId) where.empleadoId = empleadoId

    const [asignaciones, total] = await Promise.all([
      prisma.asignacion.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          empleado: { select: { id: true, nombre: true, apellido: true, rol: true, email: true } },
          proyecto: { select: { id: true, nombre: true, estado: true } },
        },
      }),
      prisma.asignacion.count({ where }),
    ])

    return NextResponse.json({
      data: asignaciones,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    logger.error({ err: error }, "Error listing asignaciones")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

export const POST = withRole(ROLES.MANAGE_PROYECTOS, async (request, _ctx, session) => {
  try {
    const body = await request.json()
    const result = validateBody(createAsignacionSchema, body)
    if (!result.success) return result.error

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: result.data.proyectoId },
      include: { servicio: { select: { nombre: true } } },
    })

    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    if (proyecto.estado !== "APROBADO" && proyecto.estado !== "EN_EJECUCION") {
      return NextResponse.json(
        { error: "Solo proyectos en estado APROBADO o EN_EJECUCION pueden tener asignaciones (AC-01)" },
        { status: 400 }
      )
    }

    if (session.user.rol === Rol.CISO) {
      const esAuditoriaOCapacitacion =
        proyecto.servicio.nombre === "AUDITORIA_ISO27001" ||
        proyecto.servicio.nombre === "CAPACITACION"

      if (esAuditoriaOCapacitacion) {
        return NextResponse.json(
          { error: "Los proyectos de Auditoría y Capacitación deben ser asignados por Gerente General (RN-14)" },
          { status: 403 }
        )
      }
    }

    const empleado = await prisma.empleado.findUnique({
      where: { id: result.data.empleadoId },
    })

    if (!empleado || !empleado.activo) {
      return NextResponse.json({ error: "Empleado no encontrado o inactivo" }, { status: 404 })
    }

    const asignacionExistente = await prisma.asignacion.findUnique({
      where: { proyectoId_empleadoId: { proyectoId: result.data.proyectoId, empleadoId: result.data.empleadoId } },
    })

    if (asignacionExistente) {
      return NextResponse.json(
        { error: "El empleado ya está asignado a este proyecto" },
        { status: 400 }
      )
    }

    const config = await prisma.configuracion.findUnique({
      where: { clave: "MAX_PROYECTOS_ACTIVOS_POR_EMPLEADO" },
    })
    const maxActivos = config ? parseInt(config.valor) : 3

    const proyectosActivos = await prisma.asignacion.count({
      where: {
        empleadoId: result.data.empleadoId,
        proyecto: {
          estado: { in: ["EN_EJECUCION", "EN_REVISION"] },
        },
      },
    })

    if (proyectosActivos >= maxActivos) {
      return NextResponse.json(
        { error: `El empleado ya tiene ${maxActivos} proyectos activos. No puede asignarse a más (RN-08)` },
        { status: 400 }
      )
    }

    const asignacion = await prisma.asignacion.create({
      data: {
        proyectoId: result.data.proyectoId,
        empleadoId: result.data.empleadoId,
        rolEnProyecto: result.data.rolEnProyecto,
      },
      include: {
        empleado: { select: { id: true, nombre: true, apellido: true, rol: true } },
        proyecto: { select: { id: true, nombre: true } },
      },
    })

    await prisma.notificacion.create({
      data: {
        empleadoId: result.data.empleadoId,
        titulo: "Nueva asignación a proyecto",
        mensaje: `Has sido asignado al proyecto "${proyecto.nombre}" con el rol de ${result.data.rolEnProyecto}.`,
        tipo: "ASIGNACION_PROYECTO",
        link: `/proyectos/${result.data.proyectoId}`,
      },
    })

    try {
      const transport = createTransporter()
      if (transport && empleado.email) {
        const logoAttachment = await getLogoAttachment()
        const logoCid = logoAttachment.length > 0 ? logoAttachment[0].cid : ""
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
        const portalUrl = `${baseUrl}/proyectos/${result.data.proyectoId}`

        await transport.sendMail({
          from: `"LoBeMo Seguridad" <${process.env.SMTP_USER}>`,
          to: resolverDestinatario(empleado.email),
          subject: `Nueva asignación a proyecto - ${proyecto.nombre}`,
          html: asignacionProyecto({
            nombreEmpleado: `${empleado.nombre} ${empleado.apellido}`,
            nombreProyecto: proyecto.nombre,
            rolEnProyecto: result.data.rolEnProyecto,
            estadoProyecto: proyecto.estado,
            portalUrl,
            logoCid,
          }),
          attachments: logoAttachment,
        })
      }
    } catch (emailError) {
      logger.error({ err: emailError }, "Error sending assignment email")
    }

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "Asignacion",
        entidadId: asignacion.id,
        detalle: { proyectoId: result.data.proyectoId, empleadoId: result.data.empleadoId, rolEnProyecto: result.data.rolEnProyecto },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(asignacion, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, "Error creating asignacion")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
