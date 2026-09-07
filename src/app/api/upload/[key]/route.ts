import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES, Rol } from "@/lib/api-auth"
import { deleteFromR2, isR2Configured } from "@/lib/r2"

export const DELETE = withRole(ROLES.MANAGE_PROYECTOS, async (_request, ctx, session) => {
  try {
    const { key } = await ctx.params
    const decodedKey = decodeURIComponent(key)

    if (!isR2Configured()) {
      return NextResponse.json(
        { error: "Almacenamiento en la nube no configurado" },
        { status: 503 }
      )
    }

    const documento = await prisma.documento.findFirst({ where: { storageKey: decodedKey } })
    if (!documento) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
    }

    const esCisoOGerente = ROLES.MANAGE_PROYECTOS.includes(session.user.rol as Rol)
    if (!esCisoOGerente && documento.proyectoId) {
      const esAsignado = await prisma.asignacion.findFirst({
        where: { proyectoId: documento.proyectoId, empleadoId: session.user.id },
      })
      if (!esAsignado) {
        return NextResponse.json(
          { error: "No tienes permiso para eliminar este documento" },
          { status: 403 }
        )
      }
    }

    await deleteFromR2(decodedKey)

    await prisma.documento.delete({ where: { id: documento.id } })

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "Documento",
        entidadId: documento.id,
        detalle: {
          nombreArchivo: documento.nombreArchivo,
          tipo: documento.tipo,
          proyectoId: documento.proyectoId,
          storageKey: decodedKey,
        },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting from R2:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
