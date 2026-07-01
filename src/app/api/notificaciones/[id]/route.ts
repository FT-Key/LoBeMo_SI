import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params

    const notificacion = await prisma.notificacion.findUnique({ where: { id } })

    if (!notificacion) {
      return NextResponse.json({ error: "Notificación no encontrada" }, { status: 404 })
    }

    if (notificacion.empleadoId !== session.user.id) {
      return NextResponse.json(
        { error: "No puedes modificar una notificación que no te pertenece" },
        { status: 403 }
      )
    }

    const actualizada = await prisma.notificacion.update({
      where: { id },
      data: { leida: true },
    })

    return NextResponse.json(actualizada)
  } catch (error) {
    console.error("Error updating notificacion:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
