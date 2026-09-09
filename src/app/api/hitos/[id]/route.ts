import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES } from "@/lib/api-auth"
import { logger } from "@/lib/logger"

export const GET = withRole(ROLES.MANAGE_PROYECTOS, async (_request, ctx) => {
  try {
    const { id } = await ctx.params

    const hito = await prisma.hito.findUnique({
      where: { id },
      include: {
        proyecto: { select: { id: true, nombre: true, estado: true } },
      },
    })

    if (!hito) {
      return NextResponse.json({ error: "Hito no encontrado" }, { status: 404 })
    }

    return NextResponse.json(hito)
  } catch (error) {
    logger.error({ err: error }, "Error getting hito")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

export const PATCH = withRole(ROLES.MANAGE_PROYECTOS, async (request, ctx, session) => {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const { nombre, descripcion, fechaPrevista, fechaReal, completado } = body

    const hitoExistente = await prisma.hito.findUnique({
      where: { id },
      include: { proyecto: { select: { estado: true } } },
    })

    if (!hitoExistente) {
      return NextResponse.json({ error: "Hito no encontrado" }, { status: 404 })
    }

    if (hitoExistente.proyecto?.estado === "CERRADO") {
      return NextResponse.json(
        { error: "No se puede modificar hitos de un proyecto cerrado" },
        { status: 400 }
      )
    }

    const data: Record<string, unknown> = {}
    if (nombre !== undefined) {
      if (!nombre.toString().trim()) {
        return NextResponse.json({ error: "El nombre no puede estar vacío" }, { status: 400 })
      }
      data.nombre = nombre.toString().trim()
    }
    if (descripcion !== undefined) {
      data.descripcion = descripcion?.toString().trim() || null
    }
    if (fechaPrevista !== undefined) {
      data.fechaPrevista = new Date(fechaPrevista)
    }
    if (fechaReal !== undefined) {
      data.fechaReal = fechaReal ? new Date(fechaReal) : null
    }
    if (completado !== undefined) {
      data.completado = Boolean(completado)
      if (completado && !fechaReal) {
        data.fechaReal = new Date()
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const hitoActualizado = await prisma.hito.update({
      where: { id },
      data,
    })

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "Hito",
        entidadId: id,
        detalle: `{ "cambios": "${Object.keys(data).join(", ")}" }`,
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(hitoActualizado)
  } catch (error) {
    logger.error({ err: error }, "Error updating hito")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

export const DELETE = withRole(ROLES.MANAGE_PROYECTOS, async (_request, ctx, session) => {
  try {
    const { id } = await ctx.params

    const hito = await prisma.hito.findUnique({
      where: { id },
      include: { proyecto: { select: { estado: true } } },
    })

    if (!hito) {
      return NextResponse.json({ error: "Hito no encontrado" }, { status: 404 })
    }

    if (hito.proyecto?.estado === "CERRADO") {
      return NextResponse.json(
        { error: "No se puede eliminar hitos de un proyecto cerrado" },
        { status: 400 }
      )
    }

    await prisma.hito.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "Hito",
        entidadId: id,
        detalle: { nombre: hito.nombre, proyectoId: hito.proyectoId },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ err: error }, "Error deleting hito")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
