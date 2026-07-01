import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const ESTADOS_VALIDOS = ["BORRADOR", "COMPLETADO"]

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

    const informe = await prisma.informeAuditoria.findUnique({
      where: { id },
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
            estado: true,
            cliente: { select: { id: true, razonSocial: true } },
          },
        },
        creador: { select: { id: true, nombre: true, apellido: true, rol: true } },
      },
    })

    if (!informe) {
      return NextResponse.json({ error: "Informe de auditoría no encontrado" }, { status: 404 })
    }

    const esCreador = informe.creadorId === session.user.id
    const esGerenteOCiso = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"
    if (!esCreador && !esGerenteOCiso) {
      return NextResponse.json(
        { error: "No autorizado para ver este informe" },
        { status: 403 }
      )
    }

    return NextResponse.json(informe)
  } catch (error) {
    console.error("Error getting informe de auditoría:", error)
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

    const { id } = await params
    const body = await request.json()
    const { alcance, criteriosAuditoria, hallazgos, noConformidades, observaciones, recomendaciones, estado } = body

    const informeExistente = await prisma.informeAuditoria.findUnique({
      where: { id },
      include: { proyecto: { select: { nombre: true } } },
    })

    if (!informeExistente) {
      return NextResponse.json({ error: "Informe de auditoría no encontrado" }, { status: 404 })
    }

    const esCreador = informeExistente.creadorId === session.user.id
    const esGerenteOCiso = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"

    if (!esCreador && !esGerenteOCiso) {
      return NextResponse.json(
        { error: "No autorizado para modificar este informe" },
        { status: 403 }
      )
    }

    if (informeExistente.estado === "COMPLETADO" && session.user.rol !== "GERENTE_GENERAL" && session.user.rol !== "CISO") {
      return NextResponse.json(
        { error: "No se puede modificar un informe completado" },
        { status: 400 }
      )
    }

    if (estado !== undefined && !ESTADOS_VALIDOS.includes(estado)) {
      return NextResponse.json(
        { error: `Estado inválido. Debe ser: ${ESTADOS_VALIDOS.join(", ")}` },
        { status: 400 }
      )
    }

    const data: Record<string, unknown> = {}
    if (alcance !== undefined) data.alcance = alcance.trim()
    if (criteriosAuditoria !== undefined) data.criteriosAuditoria = criteriosAuditoria.trim()
    if (hallazgos !== undefined) data.hallazgos = hallazgos
    if (noConformidades !== undefined) data.noConformidades = noConformidades
    if (observaciones !== undefined) data.observaciones = observaciones
    if (recomendaciones !== undefined) data.recomendaciones = recomendaciones
    if (estado !== undefined) {
      data.estado = estado
      if (estado === "COMPLETADO") {
        data.fechaEmision = new Date()
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const informeActualizado = await prisma.informeAuditoria.update({
      where: { id },
      data,
      include: {
        proyecto: { select: { id: true, nombre: true } },
        creador: { select: { id: true, nombre: true, apellido: true, rol: true } },
      },
    })

    if (estado === "COMPLETADO" && informeExistente.estado !== "COMPLETADO") {
      const gerente = await prisma.empleado.findFirst({
        where: { rol: "GERENTE_GENERAL", activo: true },
      })

      if (gerente) {
        await prisma.notificacion.create({
          data: {
            empleadoId: gerente.id,
            titulo: "Informe de auditoría completado",
            mensaje: `El informe de auditoría para el proyecto "${informeExistente.proyecto?.nombre ?? "N/A"}" ha sido completado.`,
            tipo: "CAMBIO_ESTADO",
            link: `/informes-auditoria/${id}`,
          },
        })
      }
    }

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "InformeAuditoria",
        entidadId: id,
        detalle: { cambios: Object.keys(data), estadoAnterior: informeExistente.estado },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(informeActualizado)
  } catch (error) {
    console.error("Error updating informe de auditoría:", error)
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

    const { id } = await params

    const informe = await prisma.informeAuditoria.findUnique({ where: { id } })
    if (!informe) {
      return NextResponse.json({ error: "Informe de auditoría no encontrado" }, { status: 404 })
    }

    const esCreador = informe.creadorId === session.user.id
    const esGerenteOCiso = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"

    if (!esCreador && !esGerenteOCiso) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este informe" },
        { status: 403 }
      )
    }

    if (informe.estado === "COMPLETADO") {
      return NextResponse.json(
        { error: "No se puede eliminar un informe completado" },
        { status: 400 }
      )
    }

    await prisma.informeAuditoria.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "InformeAuditoria",
        entidadId: id,
        detalle: { proyectoId: informe.proyectoId, alcance: informe.alcance },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting informe de auditoría:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
