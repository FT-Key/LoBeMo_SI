import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES } from "@/lib/api-auth"

export const DELETE = withRole(ROLES.MANAGE_PROYECTOS, async (_request, ctx, session) => {
  try {
    const { id } = await ctx.params

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
})
