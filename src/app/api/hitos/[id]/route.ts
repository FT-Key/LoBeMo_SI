import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params

    const hito = await prisma.hito.findUnique({
      where: { id },
      include: {
        proyecto: { select: { id: true, nombre: true, estado: true } },
      },
    })

    if (!hito) {
      return NextResponse.json({ error: "Hito no encontrado" }, { status: 404 })
    }

    return NextResponse.json(hito)
  } catch (error) {
    console.error("Error getting hito:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
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

    const soloCisoOGerente = session.user.rol === "CISO" || session.user.rol === "GERENTE_GENERAL"
    if (!soloCisoOGerente) {
      return NextResponse.json(
        { error: "Solo el CISO o Gerente General pueden modificar hitos (RF-36)" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { nombre, descripcion, fechaPrevista, fechaReal, completado } = body

    const hitoExistente = await prisma.hito.findUnique({
      where: { id },
      include: { proyecto: { select: { estado: true } } },
    })

    if (!hitoExistente) {
      return NextResponse.json({ error: "Hito no encontrado" }, { status: 404 })
    }

    if (hitoExistente.proyecto?.estado === "CERRADO") {
      return NextResponse.json(
        { error: "No se puede modificar hitos de un proyecto cerrado" },
        { status: 400 }
      )
    }

    const data: Record<string, unknown> = {}
    if (nombre !== undefined) {
      if (!nombre.toString().trim()) {
        return NextResponse.json({ error: "El nombre no puede estar vacío" }, { status: 400 })
      }
      data.nombre = nombre.toString().trim()
    }
    if (descripcion !== undefined) {
      data.descripcion = descripcion?.toString().trim() || null
    }
    if (fechaPrevista !== undefined) {
      data.fechaPrevista = new Date(fechaPrevista)
    }
    if (fechaReal !== undefined) {
      data.fechaReal = fechaReal ? new Date(fechaReal) : null
    }
    if (completado !== undefined) {
      data.completado = Boolean(completado)
      if (completado && !fechaReal) {
        data.fechaReal = new Date()
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const hitoActualizado = await prisma.hito.update({
      where: { id },
      data,
    })

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "Hito",
        entidadId: id,
        detalle: `{ "cambios": "${Object.keys(data).join(", ")}" }`,
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(hitoActualizado)
  } catch (error) {
    console.error("Error updating hito:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
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

    const soloCisoOGerente = session.user.rol === "CISO" || session.user.rol === "GERENTE_GENERAL"
    if (!soloCisoOGerente) {
      return NextResponse.json(
        { error: "Solo el CISO o Gerente General pueden eliminar hitos" },
        { status: 403 }
      )
    }

    const { id } = await params

    const hito = await prisma.hito.findUnique({
      where: { id },
      include: { proyecto: { select: { estado: true } } },
    })

    if (!hito) {
      return NextResponse.json({ error: "Hito no encontrado" }, { status: 404 })
    }

    if (hito.proyecto?.estado === "CERRADO") {
      return NextResponse.json(
        { error: "No se puede eliminar hitos de un proyecto cerrado" },
        { status: 400 }
      )
    }

    await prisma.hito.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "Hito",
        entidadId: id,
        detalle: { nombre: hito.nombre, proyectoId: hito.proyectoId },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting hito:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
