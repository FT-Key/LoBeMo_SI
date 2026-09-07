import { emailLayout, emailCard, emailField, emailButton } from "./layout"

interface AsignacionProyectoParams {
  nombreEmpleado: string
  nombreProyecto: string
  rolEnProyecto: string
  estadoProyecto: string
  portalUrl?: string
  logoCid?: string
}

export function asignacionProyecto({ nombreEmpleado, nombreProyecto, rolEnProyecto, estadoProyecto, portalUrl, logoCid }: AsignacionProyectoParams): string {
  return emailLayout({
    title: "Nueva asignación a proyecto",
    subtitle: `Hola ${nombreEmpleado}, has sido asignado a un nuevo proyecto`,
    logoCid,
    content: `
      ${emailCard(`
        <p style="color:#64748b;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Proyecto</p>
        <p style="color:#f1f5f9;font-size:16px;font-weight:600;margin:0 0 16px;">${nombreProyecto}</p>
        ${emailField("Tu rol", rolEnProyecto)}
        ${emailField("Estado", estadoProyecto)}
      `)}
      ${portalUrl ? emailButton("Ver proyecto", portalUrl) : ""}
      <p style="color:#475569;font-size:12px;margin:24px 0 0;">Podés ver los detalles del proyecto y tus tareas asignadas en el panel.</p>
    `,
    footer: "LoBeMo Seguridad Informática · Sistema de Gestión",
  })
}
