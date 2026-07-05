import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const PRIORIDADES = ["BAJA", "MEDIA", "ALTA", "CRITICA"]
const CATEGORIAS = ["INCIDENTE", "CONSULTA", "SOLICITUD"]

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
    const estado = searchParams.get("estado") ?? ""
    const prioridad = searchParams.get("prioridad") ?? ""
    const proyectoId = searchParams.get("proyectoId") ?? ""

    const where: Record<string, unknown> = {}
    if (estado) where.estado = estado
    if (prioridad) where.prioridad = prioridad
    if (proyectoId) where.proyectoId = proyectoId

    const puedeVer = ["SOPORTE_TECNICO", "GERENTE_GENERAL", "CISO"].includes(session.user.rol)
    if (!puedeVer) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const [tickets, total] = await Promise.all([
      prisma.ticketSoporte.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          proyecto: { select: { id: true, nombre: true } },
          creador: { select: { id: true, nombre: true, apellido: true } },
          asignadoA: { select: { id: true, nombre: true, apellido: true } },
        },
      }),
      prisma.ticketSoporte.count({ where }),
    ])

    return NextResponse.json({
      data: tickets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error listing tickets:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const puedeCrear = ["SOPORTE_TECNICO", "GERENTE_GENERAL", "CISO"].includes(session.user.rol)
    if (!puedeCrear) {
      return NextResponse.json(
        { error: "No tienes permisos para crear tickets de soporte" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { titulo, descripcion, prioridad, categoria, clienteNombre, proyectoId, asignadoAId } = body

    if (!titulo || !titulo.trim()) {
      return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 })
    }

    if (prioridad && !PRIORIDADES.includes(prioridad)) {
      return NextResponse.json(
        { error: `Prioridad inválida. Debe ser: ${PRIORIDADES.join(", ")}` },
        { status: 400 }
      )
    }

    if (categoria && !CATEGORIAS.includes(categoria)) {
      return NextResponse.json(
        { error: `Categoría inválida. Debe ser: ${CATEGORIAS.join(", ")}` },
        { status: 400 }
      )
    }

    if (proyectoId) {
      const proyecto = await prisma.proyecto.findUnique({ where: { id: proyectoId } })
      if (!proyecto) {
        return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
      }
    }

    if (asignadoAId) {
      const empleado = await prisma.empleado.findUnique({ where: { id: asignadoAId } })
      if (!empleado) {
        return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
      }
    }

    const ticket = await prisma.ticketSoporte.create({
      data: {
        titulo: titulo.trim(),
        descripcion: descripcion?.trim() || null,
        prioridad: prioridad || "MEDIA",
        categoria: categoria || null,
        clienteNombre: clienteNombre?.trim() || null,
        proyectoId: proyectoId || null,
        creadorId: session.user.id,
        asignadoAId: asignadoAId || null,
        estado: "ABIERTO",
      },
      include: {
        proyecto: { select: { id: true, nombre: true } },
        creador: { select: { id: true, nombre: true, apellido: true } },
        asignadoA: { select: { id: true, nombre: true, apellido: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "TicketSoporte",
        entidadId: ticket.id,
        detalle: { titulo: ticket.titulo, prioridad: ticket.prioridad, categoria: ticket.categoria },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
