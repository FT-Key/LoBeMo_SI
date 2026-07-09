import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const PRIORIDADES_VALIDAS = ["BAJA", "MEDIA", "ALTA", "CRITICA"]

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

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
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { proyectoId, titulo, descripcion, prioridad, fechaLimite } = body

    if (!proyectoId || !titulo) {
      return NextResponse.json(
        { error: "Proyecto y título son obligatorios" },
        { status: 400 }
      )
    }

    if (!titulo.trim()) {
      return NextResponse.json(
        { error: "El título no puede estar vacío" },
        { status: 400 }
      )
    }

    const proyecto = await prisma.proyecto.findUnique({ where: { id: proyectoId } })
    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    const prioridadFinal = PRIORIDADES_VALIDAS.includes(prioridad) ? prioridad : "MEDIA"

    const esCisoOGerente = session.user.rol === "CISO" || session.user.rol === "GERENTE_GENERAL"

    if (!esCisoOGerente) {
      const asignacion = await prisma.asignacion.findFirst({
        where: {
          proyectoId,
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
          proyectoId,
          titulo: titulo.trim(),
          descripcion: descripcion?.trim() || null,
          prioridad: prioridadFinal,
          fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
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
          detalle: { proyectoId, titulo: tarea.titulo, prioridad: prioridadFinal },
          empleadoId: session.user.id,
        },
      })

      return NextResponse.json(tarea, { status: 201 })
    }

    const tarea = await prisma.tarea.create({
      data: {
        proyectoId,
        titulo: titulo.trim(),
        descripcion: descripcion?.trim() || null,
        prioridad: prioridadFinal,
        fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
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
        detalle: { proyectoId, titulo: tarea.titulo, prioridad: prioridadFinal },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(tarea, { status: 201 })
  } catch (error) {
    console.error("Error creating tarea:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
