import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateBody } from "@/lib/api-validate"
import { createDocumentoSchema, createDocumentoBase64Schema } from "@/shared/validation"
import { withRole, ROLES, Rol } from "@/lib/api-auth"
import { deleteFromR2, isR2Configured } from "@/lib/r2"
import { logger } from "@/lib/logger"

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

async function puedeVerODocumentos(usuarioId: string, proyectoId: string, rol: Rol) {
  if (ROLES.MANAGE_PROYECTOS.includes(rol)) return true
  const asignacion = await prisma.asignacion.findFirst({
    where: { proyectoId, empleadoId: usuarioId },
  })
  return !!asignacion
}

export const GET = withRole(ROLES.MANAGE_PROYECTOS, async (request, _ctx, session) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")))
    const proyectoId = searchParams.get("proyectoId") ?? ""
    const tareaId = searchParams.get("tareaId") ?? ""

    if (!proyectoId) {
      return NextResponse.json({ error: "proyectoId es obligatorio" }, { status: 400 })
    }

    const puedeVer = await puedeVerODocumentos(session.user.id, proyectoId, session.user.rol as Rol)
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
        select: {
          id: true,
          nombreArchivo: true,
          tipo: true,
          url: true,
          mimeType: true,
          tamanio: true,
          storageKey: true,
          proyectoId: true,
          tareaId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.documento.count({ where }),
    ])

    const documentosSeguros = documentos.map((doc) => ({
      ...doc,
      url: doc.url && doc.url.startsWith("data:") ? "[base64]" : doc.url,
    }))

    return NextResponse.json({
      data: documentosSeguros,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    logger.error({ err: error }, "Error listing documentos")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

export const POST = withRole(ROLES.MANAGE_PROYECTOS, async (request, _ctx, session) => {
  try {
    const body = await request.json()

    const proyecto = await prisma.proyecto.findUnique({ where: { id: body.proyectoId } })
    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    const esCisoOGerente = ROLES.MANAGE_PROYECTOS.includes(session.user.rol as Rol)
    if (!esCisoOGerente) {
      const estaAsignado = await prisma.asignacion.findFirst({
        where: { proyectoId: body.proyectoId, empleadoId: session.user.id },
      })
      if (!estaAsignado) {
        return NextResponse.json(
          { error: "No tienes permiso para subir documentos a este proyecto" },
          { status: 403 }
        )
      }
    }

    if (body.tareaId) {
      const tarea = await prisma.tarea.findUnique({ where: { id: body.tareaId } })
      if (!tarea || tarea.proyectoId !== body.proyectoId) {
        return NextResponse.json({ error: "Tarea no encontrada en este proyecto" }, { status: 400 })
      }
    }

    if (body.storageKey) {
      const result = validateBody(createDocumentoSchema, body)
      if (!result.success) return result.error

      const documento = await prisma.documento.create({
        data: {
          proyectoId: result.data.proyectoId,
          tareaId: result.data.tareaId || null,
          nombreArchivo: result.data.nombreArchivo.trim(),
          tipo: result.data.tipo,
          storageKey: result.data.storageKey,
          mimeType: result.data.mimeType || null,
          tamanio: result.data.tamanio || null,
        },
      })

      await prisma.auditLog.create({
        data: {
          accion: "CREATE",
          entidad: "Documento",
          entidadId: documento.id,
          detalle: {
            proyectoId: result.data.proyectoId,
            nombreArchivo: documento.nombreArchivo,
            tipo: documento.tipo,
            storageKey: result.data.storageKey,
          },
          empleadoId: session.user.id,
        },
      })

      return NextResponse.json(documento, { status: 201 })
    }

    if (body.url) {
      const result = validateBody(createDocumentoBase64Schema, body)
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

      const mimeMatch = result.data.url.match(/^data:([^;]+);/)
      const mimeType = mimeMatch ? mimeMatch[1] : null

      const documento = await prisma.documento.create({
        data: {
          proyectoId: result.data.proyectoId,
          tareaId: result.data.tareaId || null,
          nombreArchivo: result.data.nombreArchivo.trim(),
          tipo: result.data.tipo,
          url: result.data.url,
          mimeType,
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
    }

    return NextResponse.json(
      { error: "Se requiere storageKey (upload a R2) o url (base64 legacy)" },
      { status: 400 }
    )
  } catch (error) {
    logger.error({ err: error }, "Error creating documento")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
