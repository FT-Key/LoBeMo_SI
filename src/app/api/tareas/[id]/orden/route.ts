import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole } from "@/lib/api-auth"
import { Rol } from "@/generated/prisma/enums"

const ALL_ROLES = Object.values(Rol)

export const PATCH = withRole(ALL_ROLES, async (request, ctx) => {
  try {
    const { id } = await ctx.params
    const body = await request.json()

    const { estado, orden } = body as { estado?: string; orden?: number }

    const tarea = await prisma.tarea.findUnique({
      where: { id },
      include: { proyecto: { select: { estado: true } } },
    })

    if (!tarea) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })
    }

    if (tarea.proyecto?.estado === "CERRADO") {
      return NextResponse.json(
        { error: "No se pueden modificar tareas de un proyecto cerrado" },
        { status: 400 }
      )
    }

    const data: { estado?: string; orden?: number } = {}
    if (estado !== undefined) data.estado = estado
    if (orden !== undefined) data.orden = orden

    const updated = await prisma.tarea.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error("Error updating task order:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})
