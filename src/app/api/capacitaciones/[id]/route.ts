import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { validateBody } from "@/lib/api-validate"
import { updateCapacitacionSchema } from "@/shared/validation"

const ESTADOS = ["PLANIFICADA", "EN_CURSO", "COMPLETADA", "CANCELADA"]

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

    const capacitacion = await prisma.capacitacion.findUnique({
      where: { id },
      include: {
        proyecto: { select: { id: true, nombre: true, estado: true } },
        asistentes: {
          orderBy: { createdAt: "asc" },
          include: {
            certificado: { select: { id: true, codigoCertificado: true, fechaEmision: true } },
          },
        },
      },
    })

    if (!capacitacion) {
      return NextResponse.json({ error: "Capacitación no encontrada" }, { status: 404 })
    }

    const puedeVer = session.user.rol === "CAPACITADOR" || session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"
    if (!puedeVer) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    return NextResponse.json(capacitacion)
  } catch (error) {
    console.error("Error getting capacitacion:", error)
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

    const puedeModificar = session.user.rol === "CAPACITADOR" || session.user.rol === "GERENTE_GENERAL"
    if (!puedeModificar) {
      return NextResponse.json(
        { error: "Solo el Capacitador o Gerente General pueden modificar capacitaciones (RN-CAP-01)" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const result = validateBody(updateCapacitacionSchema, body)
    if (!result.success) return result.error

    const existente = await prisma.capacitacion.findUnique({ where: { id } })
    if (!existente) {
      return NextResponse.json({ error: "Capacitación no encontrada" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (result.data.titulo !== undefined) updateData.titulo = result.data.titulo.trim()
    if (result.data.temario !== undefined) updateData.temario = result.data.temario.trim()
    if (result.data.duracionHoras !== undefined) updateData.duracionHoras = result.data.duracionHoras
    if (result.data.modalidad !== undefined) updateData.modalidad = result.data.modalidad
    if (result.data.fechaInicio !== undefined) updateData.fechaInicio = new Date(result.data.fechaInicio)
    if (result.data.fechaFin !== undefined) {
      updateData.fechaFin = result.data.fechaFin ? new Date(result.data.fechaFin) : null
    }
    if (result.data.materiales !== undefined) updateData.materiales = result.data.materiales || null
    if (result.data.estado !== undefined) {
      if (!ESTADOS.includes(result.data.estado)) {
        return NextResponse.json(
          { error: `Estado inválido. Debe ser: ${ESTADOS.join(", ")}` },
          { status: 400 }
        )
      }
      updateData.estado = result.data.estado
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const actualizada = await prisma.capacitacion.update({
      where: { id },
      data: updateData,
      include: {
        proyecto: { select: { id: true, nombre: true } },
        asistentes: {
          orderBy: { createdAt: "asc" },
          include: {
            certificado: { select: { id: true, codigoCertificado: true, fechaEmision: true } },
          },
        },
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "Capacitacion",
        entidadId: id,
        detalle: { cambios: Object.keys(updateData), estadoAnterior: existente.estado },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(actualizada)
  } catch (error) {
    console.error("Error updating capacitacion:", error)
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

    const puedeEliminar = session.user.rol === "CAPACITADOR" || session.user.rol === "GERENTE_GENERAL"
    if (!puedeEliminar) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params

    const capacitacion = await prisma.capacitacion.findUnique({
      where: { id },
      include: { _count: { select: { asistentes: true } } },
    })
    if (!capacitacion) {
      return NextResponse.json({ error: "Capacitación no encontrada" }, { status: 404 })
    }

    if (capacitacion.estado === "COMPLETADA") {
      return NextResponse.json({ error: "No se puede eliminar una capacitación completada" }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.certificadoCapacitacion.deleteMany({
        where: { asistente: { capacitacionId: id } },
      }),
      prisma.asistenteCapacitacion.deleteMany({ where: { capacitacionId: id } }),
      prisma.capacitacion.delete({ where: { id } }),
    ])

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "Capacitacion",
        entidadId: id,
        detalle: { titulo: capacitacion.titulo },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting capacitacion:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
