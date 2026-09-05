import { NextResponse, NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

const JWT_SECRET = process.env.PORTAL_JWT_SECRET || process.env.AUTH_SECRET || "portal-secret-fallback"

async function verifyPortalToken(request: NextRequest) {
  const token = request.cookies.get("portal-token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { proyectoId: string; tipo: string }
    if (decoded.tipo !== "portal") return null
    return decoded.proyectoId
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const proyectoId = await verifyPortalToken(request)
    if (!proyectoId) {
      return NextResponse.json(
        { error: "Sesión no válida. Ingresá nuevamente." },
        { status: 401 }
      )
    }

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: proyectoId },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        estado: true,
        fechaInicio: true,
        fechaEstimadaFin: true,
        fechaEntregaReal: true,
        createdAt: true,
        cliente: {
          select: { razonSocial: true, sector: true },
        },
        servicio: {
          select: { nombre: true, descripcion: true },
        },
        historialEstados: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            estadoAnterior: true,
            estadoNuevo: true,
            createdAt: true,
          },
        },
        hitos: {
          orderBy: { fechaPrevista: "asc" },
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            fechaPrevista: true,
            fechaReal: true,
            completado: true,
          },
        },
        documentos: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            nombreArchivo: true,
            tipo: true,
            createdAt: true,
          },
        },
        informesAuditoria: {
          where: { estado: "COMPLETADO" },
          orderBy: { fechaEmision: "desc" },
          select: {
            id: true,
            alcance: true,
            criteriosAuditoria: true,
            hallazgos: true,
            noConformidades: true,
            observaciones: true,
            recomendaciones: true,
            fechaEmision: true,
            createdAt: true,
          },
        },
        hallazgosPentesting: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            severidad: true,
            evidencia: true,
            recomendacion: true,
            estado: true,
            createdAt: true,
          },
        },
      },
    })

    if (!proyecto) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(proyecto)
  } catch (error) {
    console.error("Portal project fetch error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
