import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const ESTADOS_VALIDOS = ["BORRADOR", "COMPLETADO"]

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
    const estado = searchParams.get("estado") ?? ""

    const where: Record<string, unknown> = {}
    if (proyectoId) where.proyectoId = proyectoId
    if (estado) where.estado = estado

    if (session.user.rol !== "GERENTE_GENERAL" && session.user.rol !== "CISO") {
      where.creadorId = session.user.id
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
  } catch (error) {
    console.error("Error listing informes de auditoría:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const esAuditorOGerente = session.user.rol === "AUDITOR" || session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"
    if (!esAuditorOGerente) {
      return NextResponse.json(
        { error: "Solo el Auditor, CISO o Gerente General pueden crear informes de auditoría" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { proyectoId, alcance, criteriosAuditoria, hallazgos, noConformidades, observaciones, recomendaciones } = body

    if (!proyectoId || !alcance || !criteriosAuditoria) {
      return NextResponse.json(
        { error: "proyectoId, alcance y criteriosAuditoria son obligatorios" },
        { status: 400 }
      )
    }

    if (!alcance.trim()) {
      return NextResponse.json(
        { error: "El alcance no puede estar vacío" },
        { status: 400 }
      )
    }

    if (!criteriosAuditoria.trim()) {
      return NextResponse.json(
        { error: "Los criterios de auditoría no pueden estar vacíos" },
        { status: 400 }
      )
    }

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: proyectoId },
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
        proyectoId,
        creadorId: session.user.id,
        alcance: alcance.trim(),
        criteriosAuditoria: criteriosAuditoria.trim(),
        hallazgos: hallazgos || [],
        noConformidades: noConformidades || [],
        observaciones: observaciones || [],
        recomendaciones: recomendaciones || [],
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
        detalle: { proyectoId, alcance: informe.alcance },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(informe, { status: 201 })
  } catch (error) {
    console.error("Error creating informe de auditoría:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
