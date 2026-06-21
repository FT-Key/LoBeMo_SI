import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const puedeEliminar = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"
    if (!puedeEliminar) {
      return NextResponse.json(
        { error: "Solo el CISO o Gerente General pueden eliminar asignaciones" },
        { status: 403 }
      )
    }

    const { id } = await params

    const asignacion = await prisma.asignacion.findUnique({
      where: { id },
      include: { proyecto: { select: { estado: true } } },
    })

    if (!asignacion) {
      return NextResponse.json({ error: "Asignación no encontrada" }, { status: 404 })
    }

    if (asignacion.proyecto.estado === "CERRADO") {
      return NextResponse.json(
        { error: "No se puede eliminar asignaciones de un proyecto cerrado" },
        { status: 400 }
      )
    }

    await prisma.tarea.updateMany({
      where: { asignacionId: id },
      data: { asignacionId: null },
    })

    await prisma.asignacion.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "Asignacion",
        entidadId: id,
        detalle: { empleadoId: asignacion.empleadoId, proyectoId: asignacion.proyectoId },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting asignacion:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
