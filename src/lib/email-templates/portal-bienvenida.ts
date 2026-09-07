import { emailLayout, emailCard, emailField, emailButton } from "./layout"

interface PortalBienvenidaParams {
  nombreProyecto: string
  codigo: string
  clave: string
  portalUrl: string
  logoCid?: string
}

export function portalBienvenida({ nombreProyecto, codigo, clave, portalUrl, logoCid }: PortalBienvenidaParams): string {
  return emailLayout({
    title: "Bienvenido al portal de seguimiento",
    subtitle: "Tu proyecto ha sido creado con acceso al portal",
    logoCid,
    content: `
      ${emailCard(`
        <p style="color:#64748b;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Proyecto</p>
        <p style="color:#f1f5f9;font-size:16px;font-weight:600;margin:0 0 16px;">${nombreProyecto}</p>
        ${emailField("Código del Proyecto", codigo, { mono: true, color: "#00d4ff" })}
        ${emailField("Tu contraseña", clave, { mono: true })}
      `)}
      ${emailButton("Ingresar al portal", portalUrl)}
      <p style="color:#475569;font-size:12px;margin:24px 0 0;">Guardá estos datos. Los necesitás para acceder al seguimiento de tu proyecto.</p>
      <p style="color:#475569;font-size:12px;margin:4px 0 0;">Si no podés hacer clic en el botón, copiá y pegá este enlace:</p>
      <p style="color:#00d4ff;font-size:12px;margin:4px 0 0;word-break:break-all;">${portalUrl}</p>
    `,
    footer: "LoBeMo Seguridad Informática · Portal de Seguimiento",
  })
}
