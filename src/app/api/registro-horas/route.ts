import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole } from "@/lib/api-auth"
import { Rol } from "@/generated/prisma/enums"
import { logger } from "@/lib/logger"

const ALL_ROLES = Object.values(Rol)

export const GET = withRole(ALL_ROLES, async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const tareaId = searchParams.get("tareaId")
    const empleadoId = searchParams.get("empleadoId")

    if (!tareaId && !empleadoId) {
      return NextResponse.json(
        { error: "Se requiere tareaId o empleadoId" },
        { status: 400 }
      )
    }

    const where: Record<string, string> = {}
    if (tareaId) where.tareaId = tareaId
    if (empleadoId) where.empleadoId = empleadoId

    const registros = await prisma.registroHoras.findMany({
      where,
      orderBy: { inicio: "desc" },
      include: {
        empleado: { select: { id: true, nombre: true, apellido: true } },
        tarea: { select: { id: true, titulo: true } },
      },
    })

    return NextResponse.json({ data: registros })
  } catch (error) {
    logger.error({ err: error }, "Error fetching registros de horas")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})

export const POST = withRole(ALL_ROLES, async (request, _ctx, session) => {
  try {
    const body = await request.json()
    const { tareaId, descripcion } = body as { tareaId?: string; descripcion?: string }

    if (!tareaId) {
      return NextResponse.json(
        { error: "tareaId es obligatorio" },
        { status: 400 }
      )
    }

    const tarea = await prisma.tarea.findUnique({
      where: { id: tareaId },
      include: { proyecto: { select: { estado: true } } },
    })

    if (!tarea) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })
    }

    if (tarea.proyecto?.estado === "CERRADO") {
      return NextResponse.json(
        { error: "No se pueden registrar horas en tareas de proyectos cerrados" },
        { status: 400 }
      )
    }

    const registro = await prisma.registroHoras.create({
      data: {
        tareaId,
        empleadoId: session.user.id,
        inicio: new Date(),
        descripcion: descripcion || null,
      },
    })

    return NextResponse.json({ data: registro }, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, "Error creating registro de horas")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})
