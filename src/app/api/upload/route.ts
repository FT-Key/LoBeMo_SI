import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES, Rol } from "@/lib/api-auth"
import { uploadToR2, isR2Configured } from "@/lib/r2"

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

const MAX_SIZE_BYTES = 25 * 1024 * 1024

export const POST = withRole(ROLES.MANAGE_PROYECTOS, async (request, _ctx, session) => {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        { error: "Almacenamiento en la nube no configurado. Contacta al administrador." },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const proyectoId = formData.get("proyectoId") as string | null
    const tareaId = (formData.get("tareaId") as string) || undefined
    const tipo = (formData.get("tipo") as string) || "OTRO"

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    if (!proyectoId) {
      return NextResponse.json({ error: "proyectoId es obligatorio" }, { status: 400 })
    }

    if (!MIMES_PERMITIDOS.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no soportado. Usa PDF, imágenes, Office o texto." },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande (máx 25MB)" },
        { status: 400 }
      )
    }

    const proyecto = await prisma.proyecto.findUnique({ where: { id: proyectoId } })
    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    const esCisoOGerente = ROLES.MANAGE_PROYECTOS.includes(session.user.rol as Rol)
    if (!esCisoOGerente) {
      const estaAsignado = await prisma.asignacion.findFirst({
        where: { proyectoId, empleadoId: session.user.id },
      })
      if (!estaAsignado) {
        return NextResponse.json(
          { error: "No tienes permiso para subir documentos a este proyecto" },
          { status: 403 }
        )
      }
    }

    if (tareaId) {
      const tarea = await prisma.tarea.findUnique({ where: { id: tareaId } })
      if (!tarea || tarea.proyectoId !== proyectoId) {
        return NextResponse.json({ error: "Tarea no encontrada en este proyecto" }, { status: 400 })
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { key } = await uploadToR2(proyectoId, file.name, file.type, buffer)

    const documento = await prisma.documento.create({
      data: {
        proyectoId,
        tareaId: tareaId || null,
        nombreArchivo: file.name.trim(),
        tipo,
        storageKey: key,
        mimeType: file.type,
        tamanio: file.size,
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "Documento",
        entidadId: documento.id,
        detalle: {
          proyectoId,
          nombreArchivo: documento.nombreArchivo,
          tipo: documento.tipo,
          mimeType: documento.mimeType,
          tamanio: documento.tamanio,
          storageKey: key,
        },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(documento, { status: 201 })
  } catch (error) {
    console.error("Error uploading documento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
