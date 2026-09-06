import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES } from "@/lib/api-auth"

export const POST = withRole(ROLES.MANAGE_CAPACITACIONES, async (request, ctx, session) => {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const { asistenteId } = body

    if (!asistenteId) {
      return NextResponse.json({ error: "asistenteId es obligatorio" }, { status: 400 })
    }

    const asistente = await prisma.asistenteCapacitacion.findUnique({
      where: { id: asistenteId },
      include: { certificado: true },
    })

    if (!asistente || asistente.capacitacionId !== id) {
      return NextResponse.json({ error: "Asistente no encontrado" }, { status: 404 })
    }

    if (asistente.certificado) {
      return NextResponse.json(
        { error: "El asistente ya tiene un certificado generado" },
        { status: 400 }
      )
    }

    if (!asistente.completado) {
      return NextResponse.json(
        { error: "No se puede generar certificado para un asistente que no ha completado la capacitación (RN-CAP-03)" },
        { status: 400 }
      )
    }

    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "")
    const codigoCertificado = `CERT-${id.slice(0, 8)}-${asistenteId.slice(0, 8)}-${dateStr}`

    const certificado = await prisma.certificadoCapacitacion.create({
      data: {
        asistenteId,
        codigoCertificado,
        fechaEmision: now,
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "CertificadoCapacitacion",
        entidadId: certificado.id,
        detalle: { asistenteId, codigoCertificado },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(certificado, { status: 201 })
  } catch (error) {
    console.error("Error generating certificado:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
