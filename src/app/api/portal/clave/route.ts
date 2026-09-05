import { NextResponse, NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { portalCambioClaveSchema } from "@/shared/validation/proyectos"

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

export async function PUT(request: NextRequest) {
  try {
    const auth = await verifyPortalToken(request)
    if (!auth) {
      return NextResponse.json(
        { error: "Sesión no válida. Ingresá nuevamente." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = portalCambioClaveSchema.safeParse(body)

    if (!result.success) {
      const firstError = Object.values(result.error.flatten().fieldErrors)[0]?.[0]
      return NextResponse.json(
        { error: firstError || "Revisá los campos" },
        { status: 400 }
      )
    }

    const { claveActual, nuevaClave } = result.data

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: auth.proyectoId },
      select: { portalClave: true },
    })

    if (!proyecto || !proyecto.portalClave) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      )
    }

    const valid = await bcrypt.compare(claveActual, proyecto.portalClave)
    if (!valid) {
      return NextResponse.json(
        { error: "La clave actual es incorrecta" },
        { status: 401 }
      )
    }

    const hashed = await bcrypt.hash(nuevaClave, 12)
    await prisma.proyecto.update({
      where: { id: auth.proyectoId },
      data: { portalClave: hashed },
    })

    return NextResponse.json({ ok: true, message: "Clave actualizada correctamente" })
  } catch (error) {
    console.error("Portal password change error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
