import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateBody } from "@/lib/api-validate"
import { createServicioSchema } from "@/shared/validation"
import { withRole, ROLES } from "@/lib/api-auth"
import { logger } from "@/lib/logger"

export const GET = withRole(ROLES.MANAGE_PROYECTOS, async (request) => {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
  const search = searchParams.get("search") ?? ""

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: "insensitive" } },
      { descripcion: { contains: search, mode: "insensitive" } },
    ]
  }

  const [servicios, total] = await Promise.all([
    prisma.servicio.findMany({
      where,
      orderBy: { nombre: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { proyectos: true } } },
    }),
    prisma.servicio.count({ where }),
  ])

  return NextResponse.json({
    data: servicios,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
})

export const POST = withRole(ROLES.MANAGE_PROYECTOS, async (request, _ctx, session) => {
  try {
    const body = await request.json()
    const result = validateBody(createServicioSchema, body)
    if (!result.success) return result.error

    const existing = await prisma.servicio.findUnique({ where: { nombre: result.data.nombre } })
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un servicio con ese nombre" },
        { status: 409 }
      )
    }

    const servicio = await prisma.servicio.create({
      data: {
        nombre: result.data.nombre,
        descripcion: result.data.descripcion || null,
        precioBase: result.data.precioBase ?? null,
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "Servicio",
        entidadId: servicio.id,
        detalle: { nombre: result.data.nombre },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(servicio, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, "Error creating servicio")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})
