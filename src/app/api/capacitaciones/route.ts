import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { validateBody } from "@/lib/api-validate"
import { createCapacitacionSchema } from "@/shared/validation"

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

    const where: Record<string, unknown> = {}
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
    const result = validateBody(createCapacitacionSchema, body)
    if (!result.success) return result.error

    if (result.data.proyectoId) {
      const proyecto = await prisma.proyecto.findUnique({ where: { id: result.data.proyectoId } })
      if (!proyecto) {
        return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
      }
    }

    const capacitacion = await prisma.capacitacion.create({
      data: {
        proyectoId: result.data.proyectoId || null,
        titulo: result.data.titulo.trim(),
        temario: result.data.temario.trim(),
        duracionHoras: result.data.duracionHoras,
        modalidad: result.data.modalidad,
        fechaInicio: new Date(result.data.fechaInicio),
        fechaFin: result.data.fechaFin ? new Date(result.data.fechaFin) : null,
        materiales: result.data.materiales || null,
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
        detalle: { titulo: capacitacion.titulo, modalidad: result.data.modalidad },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(capacitacion, { status: 201 })
  } catch (error) {
    console.error("Error creating capacitacion:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
