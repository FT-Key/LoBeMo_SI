import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; asisId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (session.user.rol !== "CAPACITADOR" && session.user.rol !== "GERENTE_GENERAL") {
      return NextResponse.json(
        { error: "Solo el Capacitador puede evaluar asistentes (RN-CAP-02)" },
        { status: 403 }
      )
    }

    const { id, asisId } = await params

    const asistente = await prisma.asistenteCapacitacion.findUnique({
      where: { id: asisId },
    })
    if (!asistente || asistente.capacitacionId !== id) {
      return NextResponse.json({ error: "Asistente no encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const { evaluacion, completado, nombreAsistente, emailAsistente, organizacion } = body

    const data: Record<string, unknown> = {}
    if (nombreAsistente !== undefined) data.nombreAsistente = nombreAsistente.trim()
    if (emailAsistente !== undefined) data.emailAsistente = emailAsistente.trim()
    if (organizacion !== undefined) data.organizacion = organizacion
    if (evaluacion !== undefined) {
      if (evaluacion === null || evaluacion === "") {
        data.evaluacion = null
      } else {
        const val = parseInt(evaluacion)
        if (isNaN(val) || val < 1 || val > 10) {
          return NextResponse.json({ error: "La evaluación debe ser un número entre 1 y 10" }, { status: 400 })
        }
        data.evaluacion = val
      }
    }
    if (completado !== undefined) data.completado = Boolean(completado)

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const actualizado = await prisma.asistenteCapacitacion.update({
      where: { id: asisId },
      data,
      include: {
        certificado: { select: { id: true, codigoCertificado: true, fechaEmision: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "AsistenteCapacitacion",
        entidadId: asisId,
        detalle: { cambios: Object.keys(data) },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(actualizado)
  } catch (error) {
    console.error("Error updating asistente:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; asisId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (session.user.rol !== "CAPACITADOR" && session.user.rol !== "GERENTE_GENERAL") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id, asisId } = await params

    const asistente = await prisma.asistenteCapacitacion.findUnique({ where: { id: asisId } })
    if (!asistente || asistente.capacitacionId !== id) {
      return NextResponse.json({ error: "Asistente no encontrado" }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.certificadoCapacitacion.deleteMany({ where: { asistenteId: asisId } }),
      prisma.asistenteCapacitacion.delete({ where: { id: asisId } }),
    ])

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "AsistenteCapacitacion",
        entidadId: asisId,
        detalle: { nombreAsistente: asistente.nombreAsistente },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting asistente:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
