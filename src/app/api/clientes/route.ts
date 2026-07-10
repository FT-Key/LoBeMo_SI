import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { validateBody } from "@/lib/api-validate"
import { createClienteSchema } from "@/shared/validation"

const SECTORES = [
  "SALUD", "CONTABLE_JURIDICO", "COMERCIAL", "LOGISTICA",
  "AGROINDUSTRIA", "GOBIERNO", "OTRO",
] as const

function isValidSector(value: string): boolean {
  return SECTORES.includes(value as typeof SECTORES[number])
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
  const search = searchParams.get("search") ?? ""
  const sector = searchParams.get("sector") ?? ""
  const activo = searchParams.get("activo")

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { razonSocial: { contains: search, mode: "insensitive" } },
      { cuit: { contains: search } },
      { emailContacto: { contains: search, mode: "insensitive" } },
    ]
  }

  if (sector && isValidSector(sector)) {
    where.sector = sector
  }

  if (activo === "true") where.activo = true
  else if (activo === "false") where.activo = false

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { proyectos: true } } },
    }),
    prisma.cliente.count({ where }),
  ])

  return NextResponse.json({
    data: clientes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const result = validateBody(createClienteSchema, body)
    if (!result.success) return result.error

    const existing = await prisma.cliente.findUnique({ where: { cuit: result.data.cuit } })
    if (existing && existing.activo) {
      return NextResponse.json(
        { error: "Ya existe un cliente activo con ese CUIT" },
        { status: 409 }
      )
    }

    const cliente = await prisma.cliente.create({
      data: {
        razonSocial: result.data.razonSocial,
        cuit: result.data.cuit,
        emailContacto: result.data.emailContacto || null,
        telefono: result.data.telefono || null,
        direccion: result.data.direccion || null,
        sector: result.data.sector || null,
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "Cliente",
        entidadId: cliente.id,
        detalle: { cuit: result.data.cuit, razonSocial: result.data.razonSocial },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
