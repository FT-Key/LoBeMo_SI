import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES } from "@/lib/api-auth"
import { createTransporter, getLogoAttachment, propuestaEmail, resolverDestinatario } from "@/lib/email-templates"
import { logger } from "@/lib/logger"

export const POST = withRole(ROLES.CREATE_PROPUESTAS, async (_request, ctx, session) => {
  try {
    const { id } = await ctx.params

    const propuesta = await prisma.propuesta.findUnique({
      where: { id },
      include: {
        proyecto: {
          include: {
            cliente: { select: { id: true, razonSocial: true, emailContacto: true } },
            servicio: { select: { id: true, nombre: true } },
          },
        },
      },
    })

    if (!propuesta) {
      return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 })
    }

    if (!propuesta.proyecto.cliente.emailContacto) {
      return NextResponse.json(
        { error: "El cliente no tiene email de contacto registrado" },
        { status: 400 }
      )
    }

    const transport = createTransporter()
    if (!transport) {
      return NextResponse.json({ error: "Servicio de email no configurado" }, { status: 500 })
    }

    const logoAttachment = await getLogoAttachment()
    const logoCid = logoAttachment.length > 0 ? logoAttachment[0].cid : ""
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const portalUrl = `${baseUrl}/propuestas/${propuesta.id}`

    const montoTotal = Number(propuesta.montoTotal)
    const detalleServicios = propuesta.detalleServicios as Array<{ concepto: string; monto: number }> | null

    await transport.sendMail({
      from: `"LoBeMo Seguridad" <${process.env.SMTP_USER}>`,
      to: resolverDestinatario(propuesta.proyecto.cliente.emailContacto),
      subject: `Propuesta ${propuesta.proyecto.nombre} — LoBeMo Seguridad Informática`,
      html: propuestaEmail({
        nombreCliente: propuesta.proyecto.cliente.razonSocial,
        nombreProyecto: propuesta.proyecto.nombre,
        servicio: propuesta.proyecto.servicio.nombre,
        montoTotal,
        fechaVencimiento: propuesta.fechaVencimiento.toISOString(),
        detalleServicios,
        portalUrl,
        logoCid,
      }),
      attachments: logoAttachment,
    })

    await prisma.auditLog.create({
      data: {
        empleadoId: session.user.id,
        accion: "ENVIO_PROPUESTA",
        entidad: "Propuesta",
        entidadId: propuesta.id,
        detalle: { clienteEmail: propuesta.proyecto.cliente.emailContacto, propuestaVersion: propuesta.version },
      },
    })

    return NextResponse.json({ success: true, message: "Propuesta enviada por email" })
  } catch (error) {
    logger.error({ err: error }, "Error sending propuesta email")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
