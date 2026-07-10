import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { validateBody } from "@/lib/api-validate"
import { updateProyectoSchema } from "@/shared/validation"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const proyecto = await prisma.proyecto.findUnique({
      where: { id },
      include: {
        cliente: true,
        servicio: true,
        propuestas: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        asignaciones: {
          include: {
            empleado: { select: { id: true, nombre: true, apellido: true, rol: true } },
          },
        },
        tareas: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        hitos: {
          orderBy: { fechaPrevista: "asc" },
        },
        historialEstados: {
          orderBy: { createdAt: "desc" },
          include: {
            empleado: { select: { id: true, nombre: true, apellido: true } },
          },
        },
        _count: { select: { tareas: true, asignaciones: true, propuestas: true, documentos: true } },
      },
    })

    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(proyecto)
  } catch (error) {
    console.error("Error getting project:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const puedeEditar = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"
    if (!puedeEditar) {
      return NextResponse.json(
        { error: "No tienes permisos para editar proyectos" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const result = validateBody(updateProyectoSchema, body)
    if (!result.success) return result.error

    const existing = await prisma.proyecto.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    if (existing.estado === "CERRADO") {
      return NextResponse.json(
        { error: "No se puede modificar un proyecto cerrado" },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (result.data.nombre !== undefined) updateData.nombre = result.data.nombre
    if (result.data.descripcion !== undefined) updateData.descripcion = result.data.descripcion || null
    if (result.data.fechaEstimadaFin !== undefined) updateData.fechaEstimadaFin = result.data.fechaEstimadaFin ? new Date(result.data.fechaEstimadaFin) : null
    if (result.data.montoAcordado !== undefined) updateData.montoAcordado = result.data.montoAcordado ? parseFloat(result.data.montoAcordado) : null

    const proyecto = await prisma.proyecto.update({
      where: { id },
      data: updateData,
    })

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "Proyecto",
        entidadId: id,
        detalle: { cambios: Object.keys(updateData) },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(proyecto)
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (session.user.rol !== "GERENTE_GENERAL") {
      return NextResponse.json(
        { error: "Solo el Gerente General puede eliminar proyectos" },
        { status: 403 }
      )
    }

    const { id } = await params
    const proyecto = await prisma.proyecto.findUnique({
      where: { id },
      include: { _count: { select: { tareas: true, propuestas: true, asignaciones: true } } },
    })

    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    if (proyecto.estado !== "RELEVAMIENTO") {
      return NextResponse.json(
        { error: "Solo se pueden eliminar proyectos en estado RELEVAMIENTO" },
        { status: 400 }
      )
    }

    await prisma.historialEstado.deleteMany({ where: { proyectoId: id } })
    await prisma.proyecto.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "Proyecto",
        entidadId: id,
        detalle: { nombre: proyecto.nombre },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
