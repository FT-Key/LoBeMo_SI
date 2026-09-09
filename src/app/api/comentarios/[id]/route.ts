import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole } from "@/lib/api-auth"
import { Rol } from "@/generated/prisma/enums"
import { logger } from "@/lib/logger"

const ALL_ROLES = Object.values(Rol)

export const DELETE = withRole(ALL_ROLES, async (request, ctx, session) => {
  try {
    const { id } = await ctx.params

    if (!id) {
      return NextResponse.json(
        { error: "El ID es requerido" },
        { status: 400 }
      )
    }

    const comentario = await prisma.comentario.findUnique({
      where: { id },
      select: { id: true, autorId: true },
    })

    if (!comentario) {
      return NextResponse.json(
        { error: "Comentario no encontrado" },
        { status: 404 }
      )
    }

    if (comentario.autorId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este comentario" },
        { status: 403 }
      )
    }

    await prisma.comentario.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ err: error }, "Error deleting comentario")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})
