import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES } from "@/lib/api-auth"
import { logger } from "@/lib/logger"

export const GET = withRole(ROLES.MANAGE_PROYECTOS, async (_request, ctx, _session) => {
  try {
    const { id } = await ctx.params

    const tareas = await prisma.tarea.findMany({
      where: { proyectoId: id },
      orderBy: [{ estado: "asc" }, { orden: "asc" }],
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        estado: true,
        prioridad: true,
        orden: true,
        fechaLimite: true,
        asignacion: {
          select: {
            empleado: { select: { nombre: true, apellido: true } },
          },
        },
      },
    })

    return NextResponse.json({ tareas })
  } catch (error) {
    logger.error({ err: error }, "Error getting project tasks")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
