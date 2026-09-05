import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { readFile } from "fs/promises"
import { join } from "path"
import { createContactoSchema, SERVICIOS_CONTACTO_LABELS } from "@/shared/validation/contacto"
import { checkRateLimit } from "@/lib/rate-limit"
import { resolverDestinatario } from "@/lib/email"

function sanitize(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

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

    const safeNombre = sanitize(nombre)
    const safeEmail = sanitize(email)
    const safeTelefono = telefono ? sanitize(telefono) : ""
    const safeMensaje = sanitize(mensaje)

    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const contactEmail = process.env.CONTACT_EMAIL

    if (!smtpUser || !smtpPass || !contactEmail) {
      console.error("[contacto] Faltan variables de entorno SMTP_USER, SMTP_PASS o CONTACT_EMAIL")
      return NextResponse.json(
        { error: "Servicio de email no configurado. Contactanos directamente a info@lobemo.com" },
        { status: 503 },
      )
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: smtpUser, pass: smtpPass },
    })

    const logoPath = join(process.cwd(), "public", "lobemo-logo.png")
    const logoBuffer = await readFile(logoPath)

    const servicioLabel = servicio ? SERVICIOS_CONTACTO_LABELS[servicio] || servicio : "No especificado"
    const fecha = new Date().toLocaleDateString("es-AR", {
      timeZone: "America/Argentina/Tucuman",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    // Email al dueño de la empresa
    const ownerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#0a0a1a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a1a;padding:40px 20px">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
                <tr>
                  <td style="background:linear-gradient(135deg,#00d4ff 0%,#0099cc 100%);padding:32px;border-radius:16px 16px 0 0;text-align:center">
                    <img src="cid:logo" alt="LoBeMo" width="160" style="display:block;margin:0 auto 16px;filter:brightness(0) invert(1);max-width:100%;height:auto" />
                    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px">
                      Nuevo mensaje desde la web
                    </h1>
                    <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:13px">
                      ${fecha}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#111827;padding:32px;border-radius:0 0 16px 16px">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:24px">
                          <h2 style="color:#00d4ff;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px">
                            Datos del contacto
                          </h2>
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1f35;border-radius:12px;border:1px solid rgba(0,212,255,0.15)">
                            <tr>
                              <td style="padding:20px">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="padding-bottom:14px">
                                      <span style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Nombre</span>
                                      <br>
                                      <span style="color:#e2e8f0;font-size:15px;font-weight:600">${safeNombre}</span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding-bottom:14px">
                                      <span style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Email</span>
                                      <br>
                                      <a href="mailto:${safeEmail}" style="color:#00d4ff;font-size:15px;font-weight:600;text-decoration:none">${safeEmail}</a>
                                    </td>
                                  </tr>
                                  ${telefono ? `
                                  <tr>
                                    <td style="padding-bottom:14px">
                                      <span style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Teléfono</span>
                                      <br>
                                      <a href="tel:${safeTelefono}" style="color:#e2e8f0;font-size:15px;font-weight:600;text-decoration:none">${safeTelefono}</a>
                                    </td>
                                  </tr>
                                  ` : ""}
                                  <tr>
                                    <td>
                                      <span style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Servicio de interés</span>
                                      <br>
                                      <span style="display:inline-block;background-color:rgba(0,212,255,0.15);color:#00d4ff;font-size:13px;font-weight:600;padding:4px 12px;border-radius:6px;margin-top:4px">${servicioLabel}</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:24px">
                          <h2 style="color:#00d4ff;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px">
                            Mensaje
                          </h2>
                          <div style="background-color:#1a1f35;border-radius:12px;border:1px solid rgba(0,212,255,0.15);padding:20px">
                            <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0;white-space:pre-wrap">${safeMensaje}</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <a href="mailto:${email}?subject=Re: Consulta LoBeMo" style="display:inline-block;background:linear-gradient(135deg,#00d4ff 0%,#0099cc 100%);color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px">
                            Responder por email
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 0;text-align:center">
                    <p style="color:#475569;font-size:11px;margin:0">
                      Este mensaje fue enviado desde el formulario de contacto de lobemo.com
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    // Email de confirmación al que contacta
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#0a0a1a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a1a;padding:40px 20px">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
                <tr>
                  <td style="background:linear-gradient(135deg,#00d4ff 0%,#0099cc 100%);padding:32px;border-radius:16px 16px 0 0;text-align:center">
                    <img src="cid:logo" alt="LoBeMo" width="160" style="display:block;margin:0 auto 16px;filter:brightness(0) invert(1);max-width:100%;height:auto" />
                    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px">
                      ¡Gracias por contactarnos!
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#111827;padding:32px;border-radius:0 0 16px 16px">
                    <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0 0 20px">
                      Hola <strong style="color:#00d4ff">${safeNombre}</strong>,
                    </p>
                    <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0 0 20px">
                      Recibimos tu mensaje y queremos agradecerte por contactarnos. Nuestro equipo lo revisará y te responderemos a la brevedad.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1f35;border-radius:12px;border:1px solid rgba(0,212,255,0.15);margin-bottom:20px">
                      <tr>
                        <td style="padding:20px">
                          <p style="color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Tu consulta</p>
                          <p style="color:#e2e8f0;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap">${safeMensaje}</p>
                        </td>
                      </tr>
                    </table>
                    <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0">
                      Si necesitás algo urgente, escribinos directamente a <a href="mailto:info@lobemo.com" style="color:#00d4ff;text-decoration:none">info@lobemo.com</a> o llamanos al <a href="tel:+5493811234567" style="color:#00d4ff;text-decoration:none">+54 9 381 123-4567</a>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 0;text-align:center">
                    <p style="color:#475569;font-size:11px;margin:0">
                      LoBeMo — Seguridad Informática · Tucumán, Argentina
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    const logoAttachment = {
      filename: "lobemo-logo.png",
      content: logoBuffer,
      cid: "logo",
    }

    // Enviar email al dueño
    await transporter.sendMail({
      from: `"LoBeMo Web" <${smtpUser}>`,
      to: resolverDestinatario(contactEmail),
      replyTo: email,
      subject: `[LoBeMo] ${safeNombre} te escribió desde la web`,
      html: ownerHtml,
      attachments: [logoAttachment],
    })

    // Enviar confirmación al que contacta
    await transporter.sendMail({
      from: `"LoBeMo" <${smtpUser}>`,
      to: resolverDestinatario(email),
      subject: `¡Gracias por contactarnos, ${safeNombre}!`,
      html: confirmationHtml,
      attachments: [logoAttachment],
    })

    return NextResponse.json({ ok: true, message: "Mensaje enviado correctamente" })
  } catch (error) {
    console.error("[contacto] Error:", error)
    return NextResponse.json(
      { error: "Error al enviar el mensaje. Intentá nuevamente." },
      { status: 500 },
    )
  }
}
