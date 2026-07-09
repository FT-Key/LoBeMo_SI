import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const ROLES_PERMITIDOS_CREAR = ["GERENTE_GENERAL", "CISO"]

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
    const search = searchParams.get("search") ?? ""
    const estado = searchParams.get("estado") ?? ""
    const clienteId = searchParams.get("clienteId") ?? ""
    const servicioId = searchParams.get("servicioId") ?? ""

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { descripcion: { contains: search, mode: "insensitive" } },
      ]
    }

    if (estado) {
      where.estado = estado
    }

    if (clienteId) {
      where.clienteId = clienteId
    }

    if (servicioId) {
      where.servicioId = servicioId
    }

    const [proyectos, total] = await Promise.all([
      prisma.proyecto.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          cliente: { select: { id: true, razonSocial: true } },
          servicio: { select: { id: true, nombre: true } },
          _count: { select: { tareas: true, asignaciones: true, propuestas: true } },
          historialEstados: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { estadoNuevo: true, createdAt: true },
          },
        },
      }),
      prisma.proyecto.count({ where }),
    ])

    return NextResponse.json({
      data: proyectos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error listing projects:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (!ROLES_PERMITIDOS_CREAR.includes(session.user.rol)) {
      return NextResponse.json(
        { error: "Solo el Gerente General o el CISO pueden crear proyectos" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { nombre, descripcion, clienteId, servicioId, fechaEstimadaFin, montoAcordado } = body

    if (!nombre || !clienteId || !servicioId) {
      return NextResponse.json(
        { error: "Nombre, cliente y servicio son obligatorios" },
        { status: 400 }
      )
    }

    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } })
    if (!cliente || !cliente.activo) {
      return NextResponse.json(
        { error: "Cliente no encontrado o inactivo" },
        { status: 400 }
      )
    }

    const servicio = await prisma.servicio.findUnique({ where: { id: servicioId } })
    if (!servicio) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 400 }
      )
    }

    const proyecto = await prisma.proyecto.create({
      data: {
        nombre,
        descripcion,
        clienteId,
        servicioId,
        fechaEstimadaFin: fechaEstimadaFin ? new Date(fechaEstimadaFin) : null,
        montoAcordado: montoAcordado ? parseFloat(montoAcordado) : null,
        estado: "RELEVAMIENTO",
      },
    })

    await prisma.historialEstado.create({
      data: {
        proyectoId: proyecto.id,
        estadoAnterior: null,
        estadoNuevo: "RELEVAMIENTO",
        empleadoId: session.user.id,
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "Proyecto",
        entidadId: proyecto.id,
        detalle: { nombre, clienteId, servicioId },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(proyecto, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
