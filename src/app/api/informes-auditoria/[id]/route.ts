import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { validateBody } from "@/lib/api-validate"
import { updateInformeSchema } from "@/shared/validation"

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
    const result = validateBody(updateInformeSchema, body)
    if (!result.success) return result.error

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

    if (result.data.estado !== undefined && !ESTADOS_VALIDOS.includes(result.data.estado)) {
      return NextResponse.json(
        { error: `Estado inválido. Debe ser: ${ESTADOS_VALIDOS.join(", ")}` },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (result.data.alcance !== undefined) updateData.alcance = result.data.alcance.trim()
    if (result.data.criteriosAuditoria !== undefined) updateData.criteriosAuditoria = result.data.criteriosAuditoria.trim()
    if (result.data.hallazgos !== undefined) updateData.hallazgos = result.data.hallazgos
    if (result.data.noConformidades !== undefined) updateData.noConformidades = result.data.noConformidades
    if (result.data.observaciones !== undefined) updateData.observaciones = result.data.observaciones
    if (result.data.recomendaciones !== undefined) updateData.recomendaciones = result.data.recomendaciones
    if (result.data.estado !== undefined) {
      updateData.estado = result.data.estado
      if (result.data.estado === "COMPLETADO") {
        updateData.fechaEmision = new Date()
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const informeActualizado = await prisma.informeAuditoria.update({
      where: { id },
      data: updateData,
      include: {
        proyecto: { select: { id: true, nombre: true } },
        creador: { select: { id: true, nombre: true, apellido: true, rol: true } },
      },
    })

    if (result.data.estado === "COMPLETADO" && informeExistente.estado !== "COMPLETADO") {
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
        detalle: { cambios: Object.keys(updateData), estadoAnterior: informeExistente.estado },
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
