import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

async function puedeAccederDocumento(usuarioId: string, proyectoId: string, rol: string) {
  if (rol === "GERENTE_GENERAL" || rol === "CISO") return true
  const asignacion = await prisma.asignacion.findFirst({
    where: { proyectoId, empleadoId: usuarioId },
  })
  return !!asignacion
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params

    const documento = await prisma.documento.findUnique({
      where: { id },
    })

    if (!documento) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
    }

    const puedeVer = await puedeAccederDocumento(
      session.user.id,
      documento.proyectoId ?? "",
      session.user.rol
    )
    if (!puedeVer) {
      return NextResponse.json({ error: "No tienes permiso para ver este documento" }, { status: 403 })
    }

    return NextResponse.json(documento)
  } catch (error) {
    console.error("Error getting documento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params

    const documento = await prisma.documento.findUnique({
      where: { id },
    })

    if (!documento) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 })
    }

    const esCisoOGerente = session.user.rol === "CISO" || session.user.rol === "GERENTE_GENERAL"
    const esAsignado = documento.proyectoId ? await prisma.asignacion.findFirst({
      where: { proyectoId: documento.proyectoId, empleadoId: session.user.id },
    }) : null

    if (!esCisoOGerente && !esAsignado) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este documento" },
        { status: 403 }
      )
    }

    await prisma.documento.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "Documento",
        entidadId: id,
        detalle: { nombreArchivo: documento.nombreArchivo, tipo: documento.tipo, proyectoId: documento.proyectoId },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting documento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
