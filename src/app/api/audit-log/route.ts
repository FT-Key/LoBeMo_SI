import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES } from "@/lib/api-auth"
import { logger } from "@/lib/logger"

const ACCIONES = ["CREATE", "UPDATE", "DELETE"] as const

export const GET = withRole(ROLES.VIEW_AUDIT_LOG, async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
    const entidad = searchParams.get("entidad") ?? ""
    const empleadoId = searchParams.get("empleadoId") ?? ""
    const accion = searchParams.get("accion") ?? ""
    const fechaDesde = searchParams.get("fechaDesde") ?? ""
    const fechaHasta = searchParams.get("fechaHasta") ?? ""

    const where: Record<string, unknown> = {}

    if (entidad) {
      where.entidad = { contains: entidad, mode: "insensitive" }
    }

    if (empleadoId) {
      where.empleadoId = empleadoId
    }

    if (accion && ACCIONES.includes(accion as typeof ACCIONES[number])) {
      where.accion = accion
    }

    if (fechaDesde || fechaHasta) {
      const createdAt: Record<string, Date> = {}
      if (fechaDesde) createdAt.gte = new Date(fechaDesde)
      if (fechaHasta) createdAt.lte = new Date(fechaHasta)
      where.createdAt = createdAt
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          empleado: { select: { id: true, nombre: true, apellido: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error({ err: error }, "Error fetching audit logs")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    )
  }
})
