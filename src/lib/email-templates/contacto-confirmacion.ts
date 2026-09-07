import { sanitize } from "./utils"

interface ContactoConfirmacionParams {
  nombre: string
  mensaje: string
}

export function contactoConfirmacion({ nombre, mensaje }: ContactoConfirmacionParams): string {
  const safeNombre = sanitize(nombre)
  const safeMensaje = sanitize(mensaje)

  return `
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
                  <img src="cid:logo@lobemo" alt="LoBeMo" width="160" style="display:block;margin:0 auto 16px;filter:brightness(0) invert(1);max-width:100%;height:auto" />
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
}
