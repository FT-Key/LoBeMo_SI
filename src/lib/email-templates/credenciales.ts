import { emailLayout, emailCard, emailField, emailButton } from "./layout"

interface CredencialesParams {
  nombreProyecto: string
  codigo: string
  clave: string
  portalUrl: string
  logoCid?: string
}

export function credenciales({ nombreProyecto, codigo, clave, portalUrl, logoCid }: CredencialesParams): string {
  return emailLayout({
    title: "Tus credenciales de acceso",
    subtitle: "Estos son los datos para acceder al portal de seguimiento de tu proyecto",
    logoCid,
    content: `
      ${emailCard(`
        <p style="color:#64748b;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Proyecto</p>
        <p style="color:#f1f5f9;font-size:16px;font-weight:600;margin:0 0 16px;">${nombreProyecto}</p>
        ${emailField("Código del Proyecto", codigo, { mono: true, color: "#00d4ff" })}
        ${emailField("Contraseña", clave, { mono: true })}
      `)}
      ${emailButton("Ingresar al portal", portalUrl)}
      <p style="color:#475569;font-size:12px;margin:24px 0 0;">Guardá estos datos. Los necesitás para acceder al seguimiento de tu proyecto.</p>
    `,
    footer: "LoBeMo Seguridad Informática · Portal de Seguimiento",
  })
}
