import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES } from "@/lib/api-auth"
import { logger } from "@/lib/logger"

export const PATCH = withRole(ROLES.MANAGE_PROYECTOS, async (request, ctx, session) => {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const { estado, orden } = body

    if (!estado || typeof orden !== "number") {
      return NextResponse.json({ error: "Estado y orden son requeridos" }, { status: 400 })
    }

    const tarea = await prisma.tarea.findUnique({ where: { id } })
    if (!tarea) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })
    }

    const updated = await prisma.tarea.update({
      where: { id },
      data: { estado, orden },
    })

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "Tarea",
        entidadId: id,
        detalle: { campo: "estado", valor: estado, anterior: tarea.estado },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    logger.error({ err: error }, "Error moving task")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
