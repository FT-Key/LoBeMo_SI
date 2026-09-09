import { sanitize } from "./utils"

interface ContactoNotificacionParams {
  nombre: string
  email: string
  telefono?: string
  servicioLabel: string
  mensaje: string
  fecha: string
}

export function contactoNotificacion({ nombre, email, telefono, servicioLabel, mensaje, fecha }: ContactoNotificacionParams): string {
  const safeNombre = sanitize(nombre)
  const safeEmail = sanitize(email)
  const safeTelefono = telefono ? sanitize(telefono) : ""
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
}
