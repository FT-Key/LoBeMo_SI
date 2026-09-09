interface LayoutOptions {
  title: string
  subtitle?: string
  logoCid?: string
  content: string
  footer?: string
}

export function emailLayout({ title, subtitle, logoCid, content, footer }: LayoutOptions): string {
  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Tahoma,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
        ${logoCid ? `<img src="cid:${logoCid}" alt="LoBeMo" style="height:40px;margin-bottom:24px;" />` : ""}
        <h1 style="color:#e2e8f0;font-size:20px;margin:0 0 8px;">${title}</h1>
        ${subtitle ? `<p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">${subtitle}</p>` : ""}

        ${content}

        <hr style="border:none;border-top:1px solid #1e293b;margin:32px 0;" />
        <p style="color:#475569;font-size:11px;margin:0;">${footer || "LoBeMo Seguridad Informática"}</p>
      </div>
    </body></html>
  `
}

interface HeaderOptions {
  gradient?: boolean
  heading: string
  fecha?: string
}

export function emailHeader({ gradient, heading, fecha }: HeaderOptions): string {
  if (gradient) {
    return `
      <div style="background:linear-gradient(135deg,#00d4ff 0%,#0099cc 100%);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
          ${heading}
        </h1>
        ${fecha ? `<p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:13px;">${fecha}</p>` : ""}
      </div>
    `
  }
  return ""
}

export function emailCard(content: string): string {
  return `
    <div style="background:#111827;border:1px solid #1e293b;border-radius:12px;padding:24px;margin-bottom:24px;">
      ${content}
    </div>
  `
}

export function emailField(label: string, value: string, options?: { mono?: boolean; color?: string; isLink?: boolean; href?: string }): string {
  const color = options?.color || "#f1f5f9"
  const valueStyle = `color:${color};font-size:14px;font-weight:600;margin:0;${options?.mono ? "font-family:monospace;" : ""}`

  const valueHtml = options?.isLink
    ? `<a href="${options.href}" style="${valueStyle}text-decoration:none;">${value}</a>`
    : `<p style="${valueStyle}">${value}</p>`

  return `
    <div style="background:#1e293b;border-radius:8px;padding:12px;${options?.mono ? "" : "margin-bottom:12px;"}">
      <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;">${label}</p>
      ${valueHtml}
    </div>
  `
}

export function emailButton(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#00d4ff;color:#0a0a1a;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">${text}</a>`
}

export function emailLabel(text: string): string {
  return `<p style="color:#64748b;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">${text}</p>`
}
