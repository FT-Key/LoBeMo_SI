import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const puedeVer = session.user.rol === "CAPACITADOR" || session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"
    if (!puedeVer) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params

    const asistentes = await prisma.asistenteCapacitacion.findMany({
      where: { capacitacionId: id },
      orderBy: { createdAt: "asc" },
      include: {
        certificado: { select: { id: true, codigoCertificado: true, fechaEmision: true } },
      },
    })

    return NextResponse.json({ data: asistentes })
  } catch (error) {
    console.error("Error listing asistentes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (session.user.rol !== "CAPACITADOR" && session.user.rol !== "GERENTE_GENERAL") {
      return NextResponse.json(
        { error: "Solo el Capacitador puede registrar asistentes (RN-CAP-02)" },
        { status: 403 }
      )
    }

    const { id } = await params

    const capacitacion = await prisma.capacitacion.findUnique({ where: { id } })
    if (!capacitacion) {
      return NextResponse.json({ error: "Capacitación no encontrada" }, { status: 404 })
    }

    const body = await request.json()
    const { nombreAsistente, emailAsistente, organizacion } = body

    if (!nombreAsistente || !emailAsistente) {
      return NextResponse.json(
        { error: "nombreAsistente y emailAsistente son obligatorios" },
        { status: 400 }
      )
    }

    if (!nombreAsistente.trim() || !emailAsistente.trim()) {
      return NextResponse.json({ error: "Los campos no pueden estar vacíos" }, { status: 400 })
    }

    const asistente = await prisma.asistenteCapacitacion.create({
      data: {
        capacitacionId: id,
        nombreAsistente: nombreAsistente.trim(),
        emailAsistente: emailAsistente.trim(),
        organizacion: organizacion || null,
      },
      include: {
        certificado: { select: { id: true, codigoCertificado: true, fechaEmision: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "AsistenteCapacitacion",
        entidadId: asistente.id,
        detalle: { capacitacionId: id, nombreAsistente: asistente.nombreAsistente },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(asistente, { status: 201 })
  } catch (error) {
    console.error("Error creating asistente:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
