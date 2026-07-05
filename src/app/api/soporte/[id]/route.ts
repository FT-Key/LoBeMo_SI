import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const ESTADOS = ["ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"]
const PRIORIDADES = ["BAJA", "MEDIA", "ALTA", "CRITICA"]
const CATEGORIAS = ["INCIDENTE", "CONSULTA", "SOLICITUD"]

const ROLES_PERMITIDOS = ["SOPORTE_TECNICO", "GERENTE_GENERAL", "CISO"]

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (!ROLES_PERMITIDOS.includes(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params

    const ticket = await prisma.ticketSoporte.findUnique({
      where: { id },
      include: {
        proyecto: { select: { id: true, nombre: true, estado: true } },
        creador: { select: { id: true, nombre: true, apellido: true, email: true } },
        asignadoA: { select: { id: true, nombre: true, apellido: true, email: true } },
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error getting ticket:", error)
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

    if (!ROLES_PERMITIDOS.includes(session.user.rol)) {
      return NextResponse.json(
        { error: "No tienes permisos para modificar tickets de soporte" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { titulo, descripcion, prioridad, categoria, clienteNombre, proyectoId, asignadoAId, estado } = body

    const existente = await prisma.ticketSoporte.findUnique({ where: { id } })
    if (!existente) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 })
    }

    const data: Record<string, unknown> = {}

    if (titulo !== undefined) {
      if (!titulo.trim()) {
        return NextResponse.json({ error: "El título no puede estar vacío" }, { status: 400 })
      }
      data.titulo = titulo.trim()
    }

    if (descripcion !== undefined) data.descripcion = descripcion?.trim() || null
    if (clienteNombre !== undefined) data.clienteNombre = clienteNombre?.trim() || null

    if (prioridad !== undefined) {
      if (!PRIORIDADES.includes(prioridad)) {
        return NextResponse.json(
          { error: `Prioridad inválida. Debe ser: ${PRIORIDADES.join(", ")}` },
          { status: 400 }
        )
      }
      data.prioridad = prioridad
    }

    if (categoria !== undefined) {
      if (categoria && !CATEGORIAS.includes(categoria)) {
        return NextResponse.json(
          { error: `Categoría inválida. Debe ser: ${CATEGORIAS.join(", ")}` },
          { status: 400 }
        )
      }
      data.categoria = categoria || null
    }

    if (proyectoId !== undefined) {
      if (proyectoId) {
        const proyecto = await prisma.proyecto.findUnique({ where: { id: proyectoId } })
        if (!proyecto) {
          return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
        }
      }
      data.proyecto = proyectoId ? { connect: { id: proyectoId } } : { disconnect: true }
    }

    if (asignadoAId !== undefined) {
      if (asignadoAId) {
        const emp = await prisma.empleado.findUnique({ where: { id: asignadoAId } })
        if (!emp) {
          return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
        }
      }
      data.asignadoA = asignadoAId ? { connect: { id: asignadoAId } } : { disconnect: true }
    }

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

    const actualizado = await prisma.ticketSoporte.update({
      where: { id },
      data,
      include: {
        proyecto: { select: { id: true, nombre: true, estado: true } },
        creador: { select: { id: true, nombre: true, apellido: true, email: true } },
        asignadoA: { select: { id: true, nombre: true, apellido: true, email: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "TicketSoporte",
        entidadId: id,
        detalle: { cambios: Object.keys(data), estadoAnterior: existente.estado },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(actualizado)
  } catch (error) {
    console.error("Error updating ticket:", error)
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

    if (!ROLES_PERMITIDOS.includes(session.user.rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params

    const ticket = await prisma.ticketSoporte.findUnique({ where: { id } })
    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 })
    }

    if (ticket.estado !== "ABIERTO") {
      return NextResponse.json(
        { error: "Solo se pueden eliminar tickets en estado ABIERTO" },
        { status: 400 }
      )
    }

    await prisma.ticketSoporte.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "TicketSoporte",
        entidadId: id,
        detalle: { titulo: ticket.titulo },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting ticket:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
