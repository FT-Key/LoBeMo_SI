import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import type { Prisma } from "@prisma/client"

const MODALIDADES = ["PRESENCIAL", "REMOTA"]

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

    const where: Prisma.CapacitacionWhereInput = {}
    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: "insensitive" } },
        { temario: { contains: search, mode: "insensitive" } },
      ]
    }
    if (estado) where.estado = estado

    const esCapacitadorOGerente = session.user.rol === "CAPACITADOR" || session.user.rol === "GERENTE_GENERAL"
    const esCiso = session.user.rol === "CISO"

    if (!esCapacitadorOGerente && !esCiso) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const [capacitaciones, total] = await Promise.all([
      prisma.capacitacion.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          proyecto: { select: { id: true, nombre: true } },
          _count: { select: { asistentes: true } },
        },
      }),
      prisma.capacitacion.count({ where }),
    ])

    return NextResponse.json({
      data: capacitaciones,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error listing capacitaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const puedeCrear = session.user.rol === "CAPACITADOR" || session.user.rol === "GERENTE_GENERAL"
    if (!puedeCrear) {
      return NextResponse.json(
        { error: "Solo el Capacitador o Gerente General pueden crear capacitaciones (RN-CAP-01)" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { proyectoId, titulo, temario, duracionHoras, modalidad, fechaInicio, fechaFin, materiales } = body

    if (!titulo || !temario || !duracionHoras || !modalidad || !fechaInicio) {
      return NextResponse.json(
        { error: "titulo, temario, duracionHoras, modalidad y fechaInicio son obligatorios" },
        { status: 400 }
      )
    }

    if (!titulo.trim()) {
      return NextResponse.json({ error: "El título no puede estar vacío" }, { status: 400 })
    }

    if (!MODALIDADES.includes(modalidad)) {
      return NextResponse.json(
        { error: `Modalidad inválida. Debe ser: ${MODALIDADES.join(", ")}` },
        { status: 400 }
      )
    }

    const horas = parseInt(duracionHoras)
    if (isNaN(horas) || horas < 1) {
      return NextResponse.json({ error: "duracionHoras debe ser un número válido mayor a 0" }, { status: 400 })
    }

    const fechaInicioDate = new Date(fechaInicio)
    if (isNaN(fechaInicioDate.getTime())) {
      return NextResponse.json({ error: "fechaInicio no es una fecha válida" }, { status: 400 })
    }

    const fechaFinDate = fechaFin ? new Date(fechaFin) : null
    if (fechaFin && isNaN(fechaFinDate!.getTime())) {
      return NextResponse.json({ error: "fechaFin no es una fecha válida" }, { status: 400 })
    }

    if (proyectoId) {
      const proyecto = await prisma.proyecto.findUnique({ where: { id: proyectoId } })
      if (!proyecto) {
        return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
      }
    }

    const capacitacion = await prisma.capacitacion.create({
      data: {
        proyectoId: proyectoId || null,
        titulo: titulo.trim(),
        temario: temario.trim(),
        duracionHoras: horas,
        modalidad,
        fechaInicio: fechaInicioDate,
        fechaFin: fechaFinDate,
        materiales: materiales || null,
        estado: "PLANIFICADA",
      },
      include: {
        proyecto: { select: { id: true, nombre: true } },
        _count: { select: { asistentes: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "Capacitacion",
        entidadId: capacitacion.id,
        detalle: { titulo: capacitacion.titulo, modalidad },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(capacitacion, { status: 201 })
  } catch (error) {
    console.error("Error creating capacitacion:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
