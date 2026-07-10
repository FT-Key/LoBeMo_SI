import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { validateBody } from "@/lib/api-validate"
import { createDocumentoSchema } from "@/shared/validation"

const TIPOS_DOCUMENTO = [
  "INFORME_AUDITORIA",
  "REPORTE_PENTESTING",
  "CODIGO_FUENTE",
  "CONFIG_RED",
  "MATERIAL_CAPACITACION",
  "CONTRATO",
  "OTRO",
] as const

const MIMES_PERMITIDOS = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
]

function validarMimeDataUrl(url: string): boolean {
  const match = url.match(/^data:([^;]+);/)
  if (!match) return false
  const mime = match[1].toLowerCase()
  return MIMES_PERMITIDOS.includes(mime)
}

async function puedeVerODocumentos(usuarioId: string, proyectoId: string, rol: string) {
  if (rol === "GERENTE_GENERAL" || rol === "CISO") return true
  const asignacion = await prisma.asignacion.findFirst({
    where: { proyectoId, empleadoId: usuarioId },
  })
  return !!asignacion
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")))
    const proyectoId = searchParams.get("proyectoId") ?? ""
    const tareaId = searchParams.get("tareaId") ?? ""

    if (!proyectoId) {
      return NextResponse.json({ error: "proyectoId es obligatorio" }, { status: 400 })
    }

    const puedeVer = await puedeVerODocumentos(session.user.id, proyectoId, session.user.rol)
    if (!puedeVer) {
      return NextResponse.json({ error: "No tienes permiso para ver estos documentos" }, { status: 403 })
    }

    const where: Record<string, unknown> = { proyectoId }
    if (tareaId) where.tareaId = tareaId

    const [documentos, total] = await Promise.all([
      prisma.documento.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.documento.count({ where }),
    ])

    return NextResponse.json({
      data: documentos,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error listing documentos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const result = validateBody(createDocumentoSchema, body)
    if (!result.success) return result.error

    if (!validarMimeDataUrl(result.data.url)) {
      return NextResponse.json(
        { error: "Tipo de archivo no soportado. Usa PDF, imágenes, Office o texto." },
        { status: 400 }
      )
    }

    if (result.data.url.length > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande (máx 10MB)" },
        { status: 400 }
      )
    }

    const proyecto = await prisma.proyecto.findUnique({ where: { id: result.data.proyectoId } })
    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    const estaAsignado = await prisma.asignacion.findFirst({
      where: { proyectoId: result.data.proyectoId, empleadoId: session.user.id },
    })
    const esCisoOGerente = session.user.rol === "CISO" || session.user.rol === "GERENTE_GENERAL"

    if (!esCisoOGerente && !estaAsignado) {
      return NextResponse.json(
        { error: "No tienes permiso para subir documentos a este proyecto" },
        { status: 403 }
      )
    }

    if (result.data.tareaId) {
      const tarea = await prisma.tarea.findUnique({ where: { id: result.data.tareaId } })
      if (!tarea || tarea.proyectoId !== result.data.proyectoId) {
        return NextResponse.json({ error: "Tarea no encontrada en este proyecto" }, { status: 400 })
      }
    }

    const documento = await prisma.documento.create({
      data: {
        proyectoId: result.data.proyectoId,
        tareaId: result.data.tareaId || null,
        nombreArchivo: result.data.nombreArchivo.trim(),
        tipo: result.data.tipo,
        url: result.data.url,
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "Documento",
        entidadId: documento.id,
        detalle: { proyectoId: result.data.proyectoId, nombreArchivo: documento.nombreArchivo, tipo: documento.tipo },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(documento, { status: 201 })
  } catch (error) {
    console.error("Error creating documento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
