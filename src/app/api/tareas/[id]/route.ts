import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { validateBody } from "@/lib/api-validate"
import { updateTareaSchema } from "@/shared/validation"

const ESTADOS_VALIDOS = ["PENDIENTE", "EN_PROGRESO", "COMPLETADA", "CANCELADA"]

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

    const tarea = await prisma.tarea.findUnique({
      where: { id },
      include: {
        asignacion: {
          include: {
            empleado: { select: { id: true, nombre: true, apellido: true, rol: true } },
          },
        },
        proyecto: { select: { id: true, nombre: true, estado: true } },
      },
    })

    if (!tarea) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })
    }

    const esCisoOGerente = session.user.rol === "CISO" || session.user.rol === "GERENTE_GENERAL"
    if (!esCisoOGerente) {
      if (!tarea.proyectoId) {
        return NextResponse.json(
          { error: "Tarea no asociada a un proyecto" },
          { status: 400 }
        )
      }

      const asignacion = await prisma.asignacion.findFirst({
        where: {
          proyectoId: tarea.proyectoId,
          empleadoId: session.user.id,
        },
      })

      if (!asignacion) {
        return NextResponse.json(
          { error: "No autorizado para ver esta tarea" },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(tarea)
  } catch (error) {
    console.error("Error getting tarea:", error)
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
    const result = validateBody(updateTareaSchema, body)
    if (!result.success) return result.error

    const tareaExistente = await prisma.tarea.findUnique({
      where: { id },
      include: { proyecto: { select: { id: true, nombre: true, estado: true } } },
    })

    if (!tareaExistente) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })
    }

    if (tareaExistente.proyecto?.estado === "CERRADO") {
      return NextResponse.json(
        { error: "No se puede modificar tareas de un proyecto cerrado" },
        { status: 400 }
      )
    }

    const esCisoOGerente = session.user.rol === "CISO" || session.user.rol === "GERENTE_GENERAL"

    if (!esCisoOGerente) {
      if (!tareaExistente.proyectoId) {
        return NextResponse.json(
          { error: "Tarea no asociada a un proyecto" },
          { status: 400 }
        )
      }

      const asignacion = await prisma.asignacion.findFirst({
        where: {
          proyectoId: tareaExistente.proyectoId,
          empleadoId: session.user.id,
        },
      })

      if (!asignacion) {
        return NextResponse.json(
          { error: "Solo empleados asignados al proyecto pueden modificar tareas (RF-30)" },
          { status: 403 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (result.data.titulo !== undefined) updateData.titulo = result.data.titulo.trim()
    if (result.data.descripcion !== undefined) updateData.descripcion = result.data.descripcion?.trim() || null
    if (result.data.estado !== undefined) {
      if (!ESTADOS_VALIDOS.includes(result.data.estado)) {
        return NextResponse.json(
          { error: `Estado inválido. Debe ser: ${ESTADOS_VALIDOS.join(", ")}` },
          { status: 400 }
        )
      }
      updateData.estado = result.data.estado
    }
    if (result.data.prioridad !== undefined) updateData.prioridad = result.data.prioridad
    if (result.data.fechaLimite !== undefined) {
      updateData.fechaLimite = result.data.fechaLimite ? new Date(result.data.fechaLimite) : null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
    }

    const tareaActualizada = await prisma.tarea.update({
      where: { id },
      data: updateData,
      include: {
        asignacion: {
          include: {
            empleado: { select: { id: true, nombre: true, apellido: true, rol: true } },
          },
        },
      },
    })

    if (result.data.estado === "COMPLETADA" && tareaExistente.prioridad === "CRITICA") {
      const ciso = await prisma.empleado.findFirst({
        where: { rol: "CISO", activo: true },
      })

      if (ciso) {
        const proyecto = tareaExistente.proyecto
        const proyectoNombre = proyecto?.nombre ?? "Proyecto"
        await prisma.notificacion.create({
          data: {
            empleadoId: ciso.id,
            titulo: "Tarea crítica completada",
            mensaje: `La tarea "${tareaExistente.titulo}" del proyecto "${proyectoNombre}" ha sido completada.`,
            tipo: "ASIGNACION_PROYECTO",
            link: proyecto?.id ? `/proyectos/${proyecto.id}` : null,
          },
        })
      }
    }

    const cambiosStr = Object.keys(updateData)
      .map((k) => `${k}: ${JSON.stringify(updateData[k])}`)
      .join(", ")

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "Tarea",
        entidadId: id,
        detalle: `{ "cambios": "${cambiosStr}", "estadoAnterior": "${tareaExistente.estado}" }`,
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(tareaActualizada)
  } catch (error) {
    console.error("Error updating tarea:", error)
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
        { error: "Solo el CISO o Gerente General pueden eliminar tareas" },
        { status: 403 }
      )
    }

    const { id } = await params

    const tarea = await prisma.tarea.findUnique({
      where: { id },
      include: { proyecto: { select: { estado: true } } },
    })

    if (!tarea) {
      return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 })
    }

    if (tarea.proyecto?.estado === "CERRADO") {
      return NextResponse.json(
        { error: "No se puede eliminar tareas de un proyecto cerrado" },
        { status: 400 }
      )
    }

    await prisma.tarea.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "Tarea",
        entidadId: id,
        detalle: { titulo: tarea.titulo, proyectoId: tarea.proyectoId },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting tarea:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
