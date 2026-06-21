import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

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
    console.error("Error listing asignaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const puedeAsignar = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"
    if (!puedeAsignar) {
      return NextResponse.json(
        { error: "Solo el CISO o Gerente General pueden asignar empleados" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { proyectoId, empleadoId, rolEnProyecto } = body

    if (!proyectoId || !empleadoId || !rolEnProyecto) {
      return NextResponse.json(
        { error: "Proyecto, empleado y rol en proyecto son obligatorios" },
        { status: 400 }
      )
    }

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: proyectoId },
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

    if (session.user.rol === "CISO") {
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
      where: { id: empleadoId },
    })

    if (!empleado || !empleado.activo) {
      return NextResponse.json({ error: "Empleado no encontrado o inactivo" }, { status: 404 })
    }

    const asignacionExistente = await prisma.asignacion.findUnique({
      where: { proyectoId_empleadoId: { proyectoId, empleadoId } },
    })

    if (asignacionExistente) {
      return NextResponse.json(
        { error: "El empleado ya está asignado a este proyecto" },
        { status: 400 }
      )
    }

    const proyectosActivos = await prisma.asignacion.count({
      where: {
        empleadoId,
        proyecto: {
          estado: { in: ["EN_EJECUCION", "EN_REVISION"] },
        },
      },
    })

    if (proyectosActivos >= 3) {
      return NextResponse.json(
        { error: "El empleado ya tiene 3 proyectos activos. No puede asignarse a más (RN-08)" },
        { status: 400 }
      )
    }

    const asignacion = await prisma.asignacion.create({
      data: {
        proyectoId,
        empleadoId,
        rolEnProyecto,
      },
      include: {
        empleado: { select: { id: true, nombre: true, apellido: true, rol: true } },
        proyecto: { select: { id: true, nombre: true } },
      },
    })

    await prisma.notificacion.create({
      data: {
        empleadoId,
        titulo: "Nueva asignación a proyecto",
        mensaje: `Has sido asignado al proyecto "${proyecto.nombre}" con el rol de ${rolEnProyecto}.`,
        tipo: "ASIGNACION_PROYECTO",
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "Asignacion",
        entidadId: asignacion.id,
        detalle: { proyectoId, empleadoId, rolEnProyecto },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(asignacion, { status: 201 })
  } catch (error) {
    console.error("Error creating asignacion:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
