import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole } from "@/lib/api-auth"
import { Rol } from "@/generated/prisma/enums"

const ALL_ROLES = Object.values(Rol)

export const PATCH = withRole(ALL_ROLES, async (request, ctx, session) => {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const { descripcion } = body as { descripcion?: string }

    const registro = await prisma.registroHoras.findUnique({
      where: { id },
    })

    if (!registro) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
    }

    if (registro.empleadoId !== session.user.id) {
      return NextResponse.json(
        { error: "Solo puedes detener tus propios registros" },
        { status: 403 }
      )
    }

    if (registro.fin) {
      return NextResponse.json(
        { error: "Este registro ya fue finalizado" },
        { status: 400 }
      )
    }

    const fin = new Date()
    const duracionMin = Math.round((fin.getTime() - registro.inicio.getTime()) / 60000)

    const updated = await prisma.registroHoras.update({
      where: { id },
      data: {
        fin,
        duracionMin,
        descripcion: descripcion || registro.descripcion,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error("Error stopping registro de horas:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})

export const DELETE = withRole(ALL_ROLES, async (request, ctx, session) => {
  try {
    const { id } = await ctx.params

    const registro = await prisma.registroHoras.findUnique({
      where: { id },
    })

    if (!registro) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
    }

    if (registro.empleadoId !== session.user.id) {
      return NextResponse.json(
        { error: "Solo puedes eliminar tus propios registros" },
        { status: 403 }
      )
    }

    await prisma.registroHoras.delete({ where: { id } })

    return NextResponse.json({ data: { deleted: true } })
  } catch (error) {
    console.error("Error deleting registro de horas:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})
