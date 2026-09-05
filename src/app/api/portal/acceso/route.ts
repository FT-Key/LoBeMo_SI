import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { portalAccesoSchema } from "@/shared/validation/proyectos"

const JWT_SECRET = process.env.PORTAL_JWT_SECRET || process.env.AUTH_SECRET || "portal-secret-fallback"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = portalAccesoSchema.safeParse(body)

    if (!result.success) {
      const firstError = Object.values(result.error.flatten().fieldErrors)[0]?.[0]
      return NextResponse.json(
        { error: firstError || "Completá todos los campos" },
        { status: 400 }
      )
    }

    const { proyectoId, clave } = result.data

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: proyectoId },
      select: {
        id: true,
        nombre: true,
        portalClave: true,
        portalActivo: true,
        cliente: { select: { razonSocial: true } },
      },
    })

    if (!proyecto) {
      return NextResponse.json(
        { error: "No se encontró el proyecto" },
        { status: 404 }
      )
    }

    if (!proyecto.portalActivo) {
      return NextResponse.json(
        { error: "El acceso al portal no está habilitado para este proyecto" },
        { status: 403 }
      )
    }

    if (!proyecto.portalClave) {
      return NextResponse.json(
        { error: "No se configuró una clave de acceso" },
        { status: 400 }
      )
    }

    const valid = await bcrypt.compare(clave, proyecto.portalClave)
    if (!valid) {
      return NextResponse.json(
        { error: "Clave incorrecta" },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      { proyectoId: proyecto.id, tipo: "portal" },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    const response = NextResponse.json({
      ok: true,
      proyectoId: proyecto.id,
      nombre: proyecto.nombre,
      cliente: proyecto.cliente.razonSocial,
    })

    response.cookies.set("portal-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Portal access error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
