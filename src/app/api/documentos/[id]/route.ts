import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES, Rol } from "@/lib/api-auth"
import { deleteFromR2, isR2Configured } from "@/lib/r2"

async function puedeAccederDocumento(usuarioId: string, proyectoId: string, rol: Rol) {
  if (ROLES.MANAGE_PROYECTOS.includes(rol)) return true
  const asignacion = await prisma.asignacion.findFirst({
    where: { proyectoId, empleadoId: usuarioId },
  })
  return !!asignacion
}

export const GET = withRole(ROLES.MANAGE_PROYECTOS, async (_request, ctx, session) => {
  try {
    const { id } = await ctx.params

    const documento = await prisma.documento.findUnique({
      where: { id },
    })

    if (!documento) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
    }

    const puedeVer = await puedeAccederDocumento(
      session.user.id,
      documento.proyectoId ?? "",
      session.user.rol as Rol
    )
    if (!puedeVer) {
      return NextResponse.json({ error: "No tienes permiso para ver este documento" }, { status: 403 })
    }

    if (documento.url && documento.url.startsWith("data:")) {
      return NextResponse.json({
        ...documento,
        url: "[base64]",
        note: "Documento legacy almacenado como base64. Use la vista previa en el frontend.",
      })
    }

    return NextResponse.json(documento)
  } catch (error) {
    console.error("Error getting documento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

export const DELETE = withRole(ROLES.MANAGE_PROYECTOS, async (_request, ctx, session) => {
  try {
    const { id } = await ctx.params

    const documento = await prisma.documento.findUnique({
      where: { id },
    })

    if (!documento) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
    }

    const esCisoOGerente = ROLES.MANAGE_PROYECTOS.includes(session.user.rol as Rol)
    const esAsignado = documento.proyectoId
      ? await prisma.asignacion.findFirst({
          where: { proyectoId: documento.proyectoId, empleadoId: session.user.id },
        })
      : null

    if (!esCisoOGerente && !esAsignado) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este documento" },
        { status: 403 }
      )
    }

    if (documento.storageKey && isR2Configured()) {
      try {
        await deleteFromR2(documento.storageKey)
      } catch (r2Error) {
        console.error("Error deleting from R2 (continuing with DB delete):", r2Error)
      }
    }

    await prisma.documento.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "Documento",
        entidadId: id,
        detalle: {
          nombreArchivo: documento.nombreArchivo,
          tipo: documento.tipo,
          proyectoId: documento.proyectoId,
          storageKey: documento.storageKey,
        },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting documento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
