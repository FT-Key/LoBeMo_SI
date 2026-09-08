import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole } from "@/lib/api-auth"
import { Rol } from "@/generated/prisma/enums"
import { logger } from "@/lib/logger"

const ALL_ROLES = Object.values(Rol)

export const GET = withRole(ALL_ROLES, async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const proyectoId = searchParams.get("proyectoId")
    const tareaId = searchParams.get("tareaId")
    const ticketId = searchParams.get("ticketId")

    if (!proyectoId && !tareaId && !ticketId) {
      return NextResponse.json(
        { error: "Se requiere al menos un filtro: proyectoId, tareaId o ticketId" },
        { status: 400 }
      )
    }

    const where: Record<string, string> = {}
    if (proyectoId) where.proyectoId = proyectoId
    if (tareaId) where.tareaId = tareaId
    if (ticketId) where.ticketId = ticketId

    const comentarios = await prisma.comentario.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        contenido: true,
        createdAt: true,
        autor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            rol: true,
          },
        },
      },
    })

    return NextResponse.json({ data: comentarios })
  } catch (error) {
    logger.error({ err: error }, "Error fetching comentarios")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})

export const POST = withRole(ALL_ROLES, async (request, _ctx, session) => {
  try {
    const body = await request.json()
    const { contenido, tareaId, proyectoId, ticketId } = body

    if (!contenido || typeof contenido !== "string" || contenido.trim().length === 0) {
      return NextResponse.json(
        { error: "El contenido es requerido" },
        { status: 400 }
      )
    }

    if (contenido.trim().length > 2000) {
      return NextResponse.json(
        { error: "El contenido debe tener máximo 2000 caracteres" },
        { status: 400 }
      )
    }

    if (!tareaId && !proyectoId && !ticketId) {
      return NextResponse.json(
        { error: "Se requiere al menos un destino: tareaId, proyectoId o ticketId" },
        { status: 400 }
      )
    }

    if (tareaId) {
      const tarea = await prisma.tarea.findUnique({ where: { id: tareaId } })
      if (!tarea) {
        return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })
      }
    }

    if (proyectoId) {
      const proyecto = await prisma.proyecto.findUnique({ where: { id: proyectoId } })
      if (!proyecto) {
        return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
      }
    }

    if (ticketId) {
      const ticket = await prisma.ticketSoporte.findUnique({ where: { id: ticketId } })
      if (!ticket) {
        return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 })
      }
    }

    const empleado = await prisma.empleado.findUnique({ where: { id: session.user.id } })
    if (!empleado) {
      return NextResponse.json(
        { error: "Empleado no encontrado. Verifique su sesión." },
        { status: 400 }
      )
    }

    const comentario = await prisma.comentario.create({
      data: {
        contenido: contenido.trim(),
        autorId: session.user.id,
        tareaId: tareaId || null,
        proyectoId: proyectoId || null,
        ticketId: ticketId || null,
      },
      select: {
        id: true,
        contenido: true,
        createdAt: true,
        autor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            rol: true,
          },
        },
      },
    })

    return NextResponse.json({ data: comentario }, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, "Error creating comentario")
    if (
      error instanceof Error &&
      error.message.includes("Foreign key constraint failed")
    ) {
      return NextResponse.json(
        { error: "Referencia inválida: el empleado o la entidad asociada no existe" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})
