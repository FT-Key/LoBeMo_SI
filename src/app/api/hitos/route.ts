import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { validateBody } from "@/lib/api-validate"
import { createHitoSchema } from "@/shared/validation"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
    const proyectoId = searchParams.get("proyectoId") ?? ""

    const where: Record<string, unknown> = {}
    if (proyectoId) where.proyectoId = proyectoId

    const [hitos, total] = await Promise.all([
      prisma.hito.findMany({
        where,
        orderBy: { fechaPrevista: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          proyecto: { select: { id: true, nombre: true } },
        },
      }),
      prisma.hito.count({ where }),
    ])

    return NextResponse.json({
      data: hitos,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error listing hitos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const soloCisoOGerente = session.user.rol === "CISO" || session.user.rol === "GERENTE_GENERAL"
    if (!soloCisoOGerente) {
      return NextResponse.json(
        { error: "Solo el CISO o Gerente General pueden crear hitos (RF-36)" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const result = validateBody(createHitoSchema, body)
    if (!result.success) return result.error

    const proyecto = await prisma.proyecto.findUnique({ where: { id: result.data.proyectoId } })
    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    const hito = await prisma.hito.create({
      data: {
        proyectoId: result.data.proyectoId,
        nombre: result.data.nombre.trim(),
        descripcion: result.data.descripcion?.trim() || null,
        fechaPrevista: new Date(result.data.fechaPrevista),
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "Hito",
        entidadId: hito.id,
        detalle: { proyectoId: result.data.proyectoId, nombre: hito.nombre, fechaPrevista: hito.fechaPrevista },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(hito, { status: 201 })
  } catch (error) {
    console.error("Error creating hito:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
