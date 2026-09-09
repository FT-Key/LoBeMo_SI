import { emailLayout, emailCard, emailField, emailButton } from "./layout"

interface PropuestaEmailParams {
  nombreCliente: string
  nombreProyecto: string
  servicio: string
  montoTotal: number
  fechaVencimiento: string
  detalleServicios: Array<{ concepto: string; monto: number }> | null
  portalUrl: string
  logoCid?: string
}

export function propuestaEmail({
  nombreCliente,
  nombreProyecto,
  servicio,
  montoTotal,
  fechaVencimiento,
  detalleServicios,
  portalUrl,
  logoCid,
}: PropuestaEmailParams): string {
  const montoFormateado = montoTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })
  const fechaVenc = new Date(fechaVencimiento).toLocaleDateString("es-AR")

  const detalleHtml = detalleServicios && detalleServicios.length > 0
    ? `
      <div style="margin:16px 0 0;background:#1e293b;border-radius:8px;padding:16px;">
        <p style="color:#64748b;font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Detalle de servicios</p>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px 8px;border-bottom:1px solid #334155;color:#94a3b8;font-size:12px;">Concepto</th>
              <th style="text-align:right;padding:6px 8px;border-bottom:1px solid #334155;color:#94a3b8;font-size:12px;">Monto</th>
            </tr>
          </thead>
          <tbody>
            ${detalleServicios.map(d => `
              <tr>
                <td style="padding:6px 8px;border-bottom:1px solid #1e293b;color:#e2e8f0;font-size:13px;">${d.concepto}</td>
                <td style="text-align:right;padding:6px 8px;border-bottom:1px solid #1e293b;color:#e2e8f0;font-size:13px;">ARS ${d.monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `
    : ""

  return emailLayout({
    title: "Propuesta de Servicios",
    subtitle: `${nombreProyecto} — ${servicio.replace(/_/g, " ")}`,
    logoCid,
    content: `
      ${emailCard(`
        <p style="color:#64748b;font-size:12px;margin:0 0 4px;">Estimado/a ${nombreCliente},</p>
        <p style="color:#e2e8f0;font-size:14px;margin:0 0 16px;">Le presentamos nuestra propuesta de servicios para el proyecto <strong>${nombreProyecto}</strong>.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:0;">
          ${emailField("Monto total", `$ARS ${montoFormateado}`)}
          ${emailField("Vencimiento", fechaVenc)}
        </div>
      `)}
      ${detalleHtml}
      ${emailButton("Ver propuesta completa", portalUrl)}
      <p style="color:#475569;font-size:12px;margin:24px 0 0;">Si no podés hacer clic en el botón, copiá y pegá este enlace en tu navegador:</p>
      <p style="color:#00d4ff;font-size:12px;margin:4px 0 0;word-break:break-all;">${portalUrl}</p>
    `,
    footer: "LoBeMo Seguridad Informática · Propuestas",
  })
}
