import { NextResponse } from "next/server"
import { createContactoSchema, SERVICIOS_CONTACTO_LABELS } from "@/shared/validation/contacto"
import { checkRateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"
import {
  resolverDestinatario,
  createTransporter,
  getLogoAttachment,
  contactoNotificacion,
  contactoConfirmacion,
} from "@/lib/email-templates"

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") || "unknown"
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: `Demasiadas solicitudes. Intentá de nuevo en ${Math.ceil((rateLimit.retryAfterMs || 60000) / 1000)} segundos.` },
        { status: 429 },
      )
    }

    const contentLength = request.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > 10_000) {
      return NextResponse.json(
        { error: "El payload es demasiado grande" },
        { status: 413 },
      )
    }

    const body = await request.json()
    const result = createContactoSchema.safeParse(body)

    if (!result.success) {
      const firstError = Object.values(result.error.flatten().fieldErrors)[0]?.[0]
      return NextResponse.json(
        { error: firstError || "Revisá los campos del formulario" },
        { status: 400 },
      )
    }

    const { nombre, email, telefono, servicio, mensaje } = result.data

    const transporter = createTransporter()
    const contactEmail = process.env.CONTACT_EMAIL

    if (!transporter || !contactEmail) {
      logger.error("[contacto] Faltan variables de entorno SMTP_USER, SMTP_PASS o CONTACT_EMAIL")
      return NextResponse.json(
        { error: "Servicio de email no configurado. Contactanos directamente a info@lobemo.com" },
        { status: 503 },
      )
    }

    const servicioLabel = servicio ? SERVICIOS_CONTACTO_LABELS[servicio] || servicio : "No especificado"
    const fecha = new Date().toLocaleDateString("es-AR", {
      timeZone: "America/Argentina/Tucuman",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const logoAttachment = await getLogoAttachment()
    const smtpUser = process.env.SMTP_USER!

    // Email al dueño de la empresa
    await transporter.sendMail({
      from: `"LoBeMo Web" <${smtpUser}>`,
      to: resolverDestinatario(contactEmail),
      replyTo: email,
      subject: `[LoBeMo] ${nombre} te escribió desde la web`,
      html: contactoNotificacion({ nombre, email, telefono, servicioLabel, mensaje, fecha }),
      attachments: logoAttachment,
    })

    // Email de confirmación al que contacta
    await transporter.sendMail({
      from: `"LoBeMo" <${smtpUser}>`,
      to: resolverDestinatario(email),
      subject: `¡Gracias por contactarnos, ${nombre}!`,
      html: contactoConfirmacion({ nombre, mensaje }),
      attachments: logoAttachment,
    })

    return NextResponse.json({ ok: true, message: "Mensaje enviado correctamente" })
  } catch (error) {
    logger.error({ err: error }, "[contacto] Error")
    return NextResponse.json(
      { error: "Error al enviar el mensaje. Intentá nuevamente." },
      { status: 500 },
    )
  }
}
