import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return new Response("No autorizado", { status: 403 })
  }

  const { id } = await params

  const informe = await prisma.informeAuditoria.findUnique({
    where: { id },
    include: {
      proyecto: {
        select: {
          nombre: true,
          estado: true,
          cliente: { select: { razonSocial: true } },
        },
      },
      creador: { select: { nombre: true, apellido: true } },
    },
  })

  if (!informe) {
    return new Response("No encontrado", { status: 404 })
  }

  const esCreador = informe.creadorId === session.user.id
  const esGerenteOCiso = ["GERENTE_GENERAL", "CISO"].includes(session.user.rol)
  if (!esCreador && !esGerenteOCiso) {
    return new Response("No autorizado", { status: 403 })
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Informe de Auditoría - ${informe.proyecto.nombre}</title>
<style>
  @page { margin: 20mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; line-height: 1.6; font-size: 11pt; }
  h1 { font-size: 18pt; border-bottom: 2px solid #1a1a2e; padding-bottom: 4pt; margin-top: 0; }
  h2 { font-size: 14pt; color: #16213e; margin-top: 20pt; }
  h3 { font-size: 12pt; color: #0f3460; margin-top: 14pt; }
  table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
  th { background-color: #1a1a2e; color: #fff; padding: 6pt 8pt; text-align: left; font-size: 10pt; }
  td { padding: 6pt 8pt; border-bottom: 1px solid #ddd; font-size: 10pt; }
  .meta { margin: 10pt 0; }
  .meta dt { font-weight: bold; float: left; width: 160pt; clear: left; }
  .meta dd { margin-left: 170pt; }
  .badge { display: inline-block; padding: 2pt 8pt; border-radius: 3pt; font-size: 9pt; font-weight: bold; }
  .badge-borrador { background: #fef3c7; color: #92400e; }
  .badge-emitido { background: #dbeafe; color: #1e40af; }
  .badge-completado { background: #d1fae5; color: #065f46; }
  .section { border: 1px solid #e5e7eb; border-radius: 4pt; padding: 10pt; margin: 10pt 0; }
  .footer { margin-top: 30pt; padding-top: 10pt; border-top: 1px solid #ccc; font-size: 9pt; color: #666; text-align: center; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <div style="text-align:center;margin-bottom:20pt">
    <h1 style="border:none">LoBeMo Seguridad Informática</h1>
    <p style="font-size:10pt;color:#666">Informe de Auditoría</p>
  </div>

  <table>
    <tr><th style="width:30%">Campo</th><th>Detalle</th></tr>
    <tr><td>Cliente</td><td>${informe.proyecto.cliente.razonSocial}</td></tr>
    <tr><td>Proyecto</td><td>${informe.proyecto.nombre}</td></tr>
    <tr><td>Estado del proyecto</td><td>${informe.proyecto.estado.replace(/_/g, " ")}</td></tr>
    <tr><td>Auditor</td><td>${informe.creador.nombre} ${informe.creador.apellido}</td></tr>
    <tr><td>Estado del informe</td><td><span class="badge badge-${informe.estado.toLowerCase()}">${informe.estado}</span></td></tr>
    <tr><td>Fecha de emisión</td><td>${informe.fechaEmision ? new Date(informe.fechaEmision).toLocaleDateString("es-AR") : "—"}</td></tr>
    <tr><td>Creación</td><td>${new Date(informe.createdAt).toLocaleDateString("es-AR")}</td></tr>
  </table>

  <h2>Alcance</h2>
  <div class="section">${informe.alcance.replace(/\n/g, "<br>")}</div>

  <h2>Criterios de Auditoría</h2>
  <div class="section">${informe.criteriosAuditoria.replace(/\n/g, "<br>")}</div>

  ${(() => {
    type JsonItem = { descripcion?: string; tipo?: string; severidad?: string }
    const hallazgos = typeof informe.hallazgos === "string" ? JSON.parse(informe.hallazgos) : informe.hallazgos
    const noConformidades = typeof informe.noConformidades === "string" ? JSON.parse(informe.noConformidades) : informe.noConformidades
    const observaciones = typeof informe.observaciones === "string" ? JSON.parse(informe.observaciones) : informe.observaciones
    const recomendacionesRef = typeof informe.recomendaciones === "string" ? JSON.parse(informe.recomendaciones) : informe.recomendaciones
    return `
    <h2>Hallazgos</h2>
    ${Array.isArray(hallazgos) && hallazgos.length > 0
      ? `<table><tr><th>#</th><th>Hallazgo</th><th>Tipo</th><th>Severidad</th></tr>${hallazgos.map((h: JsonItem, i: number) => `<tr><td>${i + 1}</td><td>${h.descripcion ?? h}</td><td>${h.tipo ?? "—"}</td><td>${h.severidad ?? "—"}</td></tr>`).join("")}</table>`
      : "<p>Sin hallazgos registrados.</p>"}

    <h2>No Conformidades</h2>
    ${Array.isArray(noConformidades) && noConformidades.length > 0
      ? `<ul>${noConformidades.map((nc: JsonItem) => `<li>${nc.descripcion ?? nc}</li>`).join("")}</ul>`
      : "<p>Sin no conformidades registradas.</p>"}

    <h2>Observaciones</h2>
    ${Array.isArray(observaciones) && observaciones.length > 0
      ? `<ul>${observaciones.map((o: JsonItem) => `<li>${o.descripcion ?? o}</li>`).join("")}</ul>`
      : "<p>Sin observaciones registradas.</p>"}

    <h2>Recomendaciones</h2>
    ${Array.isArray(recomendacionesRef) && recomendacionesRef.length > 0
      ? `<ul>${recomendacionesRef.map((r: JsonItem) => `<li>${r.descripcion ?? r}</li>`).join("")}</ul>`
      : "<p>Sin recomendaciones registradas.</p>"}`
  })()}

  <div class="footer">
    <p>LoBeMo Seguridad Informática — Informe generado el ${new Date().toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}</p>
    <p>Documento confidencial — Solo para uso interno y del cliente</p>
  </div>

  <div class="no-print" style="text-align:center;margin-top:20pt">
    <button onclick="window.print()" style="padding:8pt 20pt;background:#1a1a2e;color:#fff;border:none;border-radius:4pt;cursor:pointer;font-size:11pt">Imprimir / Guardar PDF</button>
  </div>
  <script>setTimeout(() => window.print(), 500)</script>
</body>
</html>`

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
}
