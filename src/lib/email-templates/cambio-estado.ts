import { emailLayout, emailCard, emailButton } from "./layout"

interface CambioEstadoParams {
  nombreProyecto: string
  estadoAnterior: string
  nuevoEstado: string
  portalUrl: string
  logoCid?: string
}

const ESTADOS_LABELS: Record<string, string> = {
  RELEVAMIENTO: "Relevamiento",
  PROPUESTA: "Propuesta",
  APROBADO: "Aprobado",
  EN_EJECUCION: "En Ejecución",
  EN_REVISION: "En Revisión",
  ENTREGADO: "Entregado",
  CERRADO: "Cerrado",
}

export function cambioEstado({ nombreProyecto, estadoAnterior, nuevoEstado, portalUrl, logoCid }: CambioEstadoParams): string {
  const labelAnterior = ESTADOS_LABELS[estadoAnterior] || estadoAnterior
  const labelNuevo = ESTADOS_LABELS[nuevoEstado] || nuevoEstado

  return emailLayout({
    title: "Actualización de estado",
    subtitle: "Tu proyecto ha cambiado de estado",
    logoCid,
    content: `
      ${emailCard(`
        <p style="color:#64748b;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Proyecto</p>
        <p style="color:#f1f5f9;font-size:16px;font-weight:600;margin:0 0 16px;">${nombreProyecto}</p>
        <div style="display:flex;gap:16px;margin-bottom:0;">
          <div style="flex:1;background:#1e293b;border-radius:8px;padding:12px;">
            <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Anterior</p>
            <p style="color:#94a3b8;font-size:14px;margin:0;">${labelAnterior}</p>
          </div>
          <div style="flex:0 0 auto;display:flex;align-items:center;color:#00d4ff;font-size:20px;">→</div>
          <div style="flex:1;background:#1e293b;border-radius:8px;padding:12px;">
            <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Nuevo</p>
            <p style="color:#00d4ff;font-size:14px;font-weight:600;margin:0;">${labelNuevo}</p>
          </div>
        </div>
      `)}
      ${emailButton("Ver seguimiento del proyecto", portalUrl)}
      <p style="color:#475569;font-size:12px;margin:24px 0 0;">Si no podés hacer clic en el botón, copiá y pegá este enlace en tu navegador:</p>
      <p style="color:#00d4ff;font-size:12px;margin:4px 0 0;word-break:break-all;">${portalUrl}</p>
    `,
    footer: "LoBeMo Seguridad Informática · Seguimiento de Proyectos",
  })
}
