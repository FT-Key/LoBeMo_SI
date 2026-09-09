import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateBody } from "@/lib/api-validate"
import { createInformeSchema } from "@/shared/validation"
import { withRole, ROLES } from "@/lib/api-auth"
import { logger } from "@/lib/logger"

export const GET = withRole(ROLES.VIEW_METRICAS, async (request) => {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
  const proyectoId = searchParams.get("proyectoId") ?? ""
  const estado = searchParams.get("estado") ?? ""
  const search = searchParams.get("search") ?? ""

  const where: Record<string, unknown> = {}
  if (proyectoId) where.proyectoId = proyectoId
  if (estado) where.estado = estado
  if (search) {
    where.OR = [
      { alcance: { contains: search, mode: "insensitive" } },
      { proyecto: { nombre: { contains: search, mode: "insensitive" } } },
    ]
  }

  const [informes, total] = await Promise.all([
    prisma.informeAuditoria.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        proyecto: { select: { id: true, nombre: true, estado: true } },
        creador: { select: { id: true, nombre: true, apellido: true, rol: true } },
      },
    }),
    prisma.informeAuditoria.count({ where }),
  ])

  return NextResponse.json({
    data: informes,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
})

export const POST = withRole(ROLES.MANAGE_PROYECTOS, async (request, _ctx, session) => {
  try {
    const body = await request.json()
    const result = validateBody(createInformeSchema, body)
    if (!result.success) return result.error

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: result.data.proyectoId },
      include: { servicio: { select: { nombre: true } } },
    })
    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    if (proyecto.servicio.nombre !== "AUDITORIA_ISO27001") {
      return NextResponse.json(
        { error: "Los informes de auditoría solo pueden asociarse a proyectos de tipo AUDITORIA_ISO27001 (RF-49)" },
        { status: 400 }
      )
    }

    const informe = await prisma.informeAuditoria.create({
      data: {
        proyectoId: result.data.proyectoId,
        creadorId: session.user.id,
        alcance: result.data.alcance.trim(),
        criteriosAuditoria: result.data.criteriosAuditoria.trim(),
        hallazgos: [],
        noConformidades: [],
        observaciones: [],
        recomendaciones: [],
        estado: "BORRADOR",
      },
      include: {
        proyecto: { select: { id: true, nombre: true } },
        creador: { select: { id: true, nombre: true, apellido: true, rol: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "InformeAuditoria",
        entidadId: informe.id,
        detalle: { proyectoId: result.data.proyectoId, alcance: informe.alcance },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(informe, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, "Error creating informe de auditoría")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
