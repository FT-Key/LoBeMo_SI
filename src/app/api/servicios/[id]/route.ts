import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES, Rol } from "@/lib/api-auth"
import { logger } from "@/lib/logger"

export const GET = withRole(ROLES.MANAGE_PROYECTOS, async (_request, ctx) => {
  const { id } = await ctx.params
  const servicio = await prisma.servicio.findUnique({
    where: { id },
    include: { _count: { select: { proyectos: true } } },
  })

  if (!servicio) {
    return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
  }

  return NextResponse.json(servicio)
})

export const PATCH = withRole([Rol.GERENTE_GENERAL] as Rol[], async (request, ctx, session) => {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const { descripcion, precioBase } = body

    const existing = await prisma.servicio.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (descripcion !== undefined) {
      if (typeof descripcion !== "string") {
        return NextResponse.json({ error: "La descripción debe ser un texto" }, { status: 400 })
      }
      data.descripcion = descripcion
    }
    if (precioBase !== undefined) {
      if (precioBase !== null && (typeof precioBase !== "number" || isNaN(precioBase))) {
        return NextResponse.json({ error: "El precio base debe ser un número válido" }, { status: 400 })
      }
      data.precioBase = precioBase
    }

    const servicio = await prisma.servicio.update({
      where: { id },
      data,
    })

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "Servicio",
        entidadId: id,
        detalle: { cambios: Object.keys(data), nombre: existing.nombre },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(servicio)
  } catch (error) {
    logger.error({ err: error }, "Error updating service")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})

export const DELETE = withRole([Rol.GERENTE_GENERAL] as Rol[], async (_request, ctx, session) => {
  try {
    const { id } = await ctx.params
    const servicio = await prisma.servicio.findUnique({
      where: { id },
      include: { _count: { select: { proyectos: true } } },
    })

    if (!servicio) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    if (servicio._count.proyectos > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar "${servicio.nombre}" porque tiene ${servicio._count.proyectos} proyecto(s) asociado(s)`,
        },
        { status: 400 }
      )
    }

    await prisma.servicio.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "Servicio",
        entidadId: id,
        detalle: { nombre: servicio.nombre },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ err: error }, "Error deleting service")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})
