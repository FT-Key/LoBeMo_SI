import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES } from "@/lib/api-auth"
import { logger } from "@/lib/logger"

export const GET = withRole(ROLES.MANAGE_PROYECTOS, async (_request, ctx, _session) => {
  try {
    const { id } = await ctx.params

    const proyecto = await prisma.proyecto.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        estado: true,
        fechaInicio: true,
        fechaEstimadaFin: true,
        tareas: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            titulo: true,
            estado: true,
            prioridad: true,
            createdAt: true,
            fechaLimite: true,
          },
        },
        hitos: {
          orderBy: { fechaPrevista: "asc" },
          select: { id: true, nombre: true, fechaPrevista: true, completado: true },
        },
      },
    })

    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(proyecto)
  } catch (error) {
    logger.error({ err: error }, "Error getting project gantt data")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
