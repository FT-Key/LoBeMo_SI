import { NextResponse, NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

const JWT_SECRET = process.env.PORTAL_JWT_SECRET || process.env.AUTH_SECRET || "portal-secret-fallback"

async function verifyPortalToken(request: NextRequest) {
  const token = request.cookies.get("portal-token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { proyectoId: string; codigo?: string; tipo: string }
    if (decoded.tipo !== "portal") return null
    return { proyectoId: decoded.proyectoId, codigo: decoded.codigo }
  } catch {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyPortalToken(request)
    if (!auth) {
      return NextResponse.json(
        { error: "Sesión no válida" },
        { status: 401 }
      )
    }

    const { id } = await params
    const documento = await prisma.documento.findUnique({
      where: { id },
      select: {
        id: true,
        nombreArchivo: true,
        tipo: true,
        url: true,
        proyectoId: true,
      },
    })

    if (!documento) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      )
    }

    if (documento.proyectoId !== auth.proyectoId) {
      return NextResponse.json(
        { error: "No tenés acceso a este documento" },
        { status: 403 }
      )
    }

    return NextResponse.redirect(documento.url)
  } catch (error) {
    console.error("Portal document access error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
