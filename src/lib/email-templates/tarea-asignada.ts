import { emailLayout, emailCard, emailField, emailButton } from "./layout"

interface TareaAsignadaParams {
  nombreEmpleado: string
  tituloTarea: string
  nombreProyecto: string
  prioridad: string
  fechaLimite?: string
  portalUrl?: string
  logoCid?: string
}

const PRIORIDAD_COLORS: Record<string, string> = {
  CRITICA: "#ef4444",
  ALTA: "#f97316",
  MEDIA: "#eab308",
  BAJA: "#22c55e",
}

export function tareaAsignada({ nombreEmpleado, tituloTarea, nombreProyecto, prioridad, fechaLimite, portalUrl, logoCid }: TareaAsignadaParams): string {
  const prioridadColor = PRIORIDAD_COLORS[prioridad] || "#94a3b8"

  return emailLayout({
    title: "Nueva tarea asignada",
    subtitle: `Hola ${nombreEmpleado}, se te ha asignado una nueva tarea`,
    logoCid,
    content: `
      ${emailCard(`
        <p style="color:#64748b;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Tarea</p>
        <p style="color:#f1f5f9;font-size:16px;font-weight:600;margin:0 0 16px;">${tituloTarea}</p>
        ${emailField("Proyecto", nombreProyecto)}
        <div style="background:#1e293b;border-radius:8px;padding:12px;margin-bottom:12px;">
          <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Prioridad</p>
          <p style="color:${prioridadColor};font-size:14px;font-weight:600;margin:0;">${prioridad}</p>
        </div>
        ${fechaLimite ? emailField("Fecha límite", fechaLimite) : ""}
      `)}
      ${portalUrl ? emailButton("Ver tarea", portalUrl) : ""}
      <p style="color:#475569;font-size:12px;margin:24px 0 0;">Recordá actualizar el estado de la tarea cuando avances.</p>
    `,
    footer: "LoBeMo Seguridad Informática · Sistema de Gestión",
  })
}
