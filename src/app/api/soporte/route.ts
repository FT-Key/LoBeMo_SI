import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateBody } from "@/lib/api-validate"
import { createTicketSchema } from "@/shared/validation"
import { withRole, ROLES } from "@/lib/api-auth"
import { logger } from "@/lib/logger"

export const GET = withRole(ROLES.VIEW_SOPORTE, async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
    const estado = searchParams.get("estado") ?? ""
    const prioridad = searchParams.get("prioridad") ?? ""
    const proyectoId = searchParams.get("proyectoId") ?? ""
    const search = searchParams.get("search") ?? ""

    const where: Record<string, unknown> = {}
    if (estado) where.estado = estado
    if (prioridad) where.prioridad = prioridad
    if (proyectoId) where.proyectoId = proyectoId
    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: "insensitive" } },
        { clienteNombre: { contains: search, mode: "insensitive" } },
        { proyecto: { nombre: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [tickets, total] = await Promise.all([
      prisma.ticketSoporte.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          proyecto: { select: { id: true, nombre: true } },
          creador: { select: { id: true, nombre: true, apellido: true } },
          asignadoA: { select: { id: true, nombre: true, apellido: true } },
        },
      }),
      prisma.ticketSoporte.count({ where }),
    ])

    return NextResponse.json({
      data: tickets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    logger.error({ err: error }, "Error listing tickets")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

export const POST = withRole(ROLES.VIEW_SOPORTE, async (request, _ctx, session) => {
  try {
    const body = await request.json()
    const result = validateBody(createTicketSchema, body)
    if (!result.success) return result.error

    if (result.data.proyectoId) {
      const proyecto = await prisma.proyecto.findUnique({ where: { id: result.data.proyectoId } })
      if (!proyecto) {
        return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
      }
    }

    if (result.data.asignadoAId) {
      const empleado = await prisma.empleado.findUnique({ where: { id: result.data.asignadoAId } })
      if (!empleado) {
        return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
      }
    }

    const ticket = await prisma.ticketSoporte.create({
      data: {
        titulo: result.data.titulo.trim(),
        descripcion: result.data.descripcion?.trim() || null,
        prioridad: result.data.prioridad,
        categoria: result.data.categoria || null,
        clienteNombre: result.data.clienteNombre?.trim() || null,
        proyectoId: result.data.proyectoId || null,
        creadorId: session.user.id,
        asignadoAId: result.data.asignadoAId || null,
        estado: "ABIERTO",
      },
      include: {
        proyecto: { select: { id: true, nombre: true } },
        creador: { select: { id: true, nombre: true, apellido: true } },
        asignadoA: { select: { id: true, nombre: true, apellido: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "TicketSoporte",
        entidadId: ticket.id,
        detalle: { titulo: ticket.titulo, prioridad: ticket.prioridad, categoria: ticket.categoria },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, "Error creating ticket")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
