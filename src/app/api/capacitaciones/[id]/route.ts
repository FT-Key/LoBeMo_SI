import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

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
    const { titulo, temario, duracionHoras, modalidad, fechaInicio, fechaFin, materiales, estado } = body

    const existente = await prisma.capacitacion.findUnique({ where: { id } })
    if (!existente) {
      return NextResponse.json({ error: "Capacitación no encontrada" }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (titulo !== undefined) data.titulo = titulo.trim()
    if (temario !== undefined) data.temario = temario.trim()
    if (duracionHoras !== undefined) {
      const horas = parseInt(duracionHoras)
      if (isNaN(horas) || horas < 1) {
        return NextResponse.json({ error: "duracionHoras debe ser un número válido mayor a 0" }, { status: 400 })
      }
      data.duracionHoras = horas
    }
    if (modalidad !== undefined) {
      if (!["PRESENCIAL", "REMOTA"].includes(modalidad)) {
        return NextResponse.json({ error: "Modalidad inválida" }, { status: 400 })
      }
      data.modalidad = modalidad
    }
    if (fechaInicio !== undefined) {
      const d = new Date(fechaInicio)
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: "fechaInicio no es una fecha válida" }, { status: 400 })
      }
      data.fechaInicio = d
    }
    if (fechaFin !== undefined) {
      if (fechaFin) {
        const d = new Date(fechaFin)
        if (isNaN(d.getTime())) {
          return NextResponse.json({ error: "fechaFin no es una fecha válida" }, { status: 400 })
        }
        data.fechaFin = d
      } else {
        data.fechaFin = null
      }
    }
    if (materiales !== undefined) data.materiales = materiales || null
    if (estado !== undefined) {
      if (!ESTADOS.includes(estado)) {
        return NextResponse.json(
          { error: `Estado inválido. Debe ser: ${ESTADOS.join(", ")}` },
          { status: 400 }
        )
      }
      data.estado = estado
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const actualizada = await prisma.capacitacion.update({
      where: { id },
      data,
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
        detalle: { cambios: Object.keys(data), estadoAnterior: existente.estado },
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
