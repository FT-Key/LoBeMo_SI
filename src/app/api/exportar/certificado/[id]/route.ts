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

  const certificado = await prisma.certificadoCapacitacion.findUnique({
    where: { id },
    include: {
      asistente: {
        include: {
          capacitacion: {
            select: {
              titulo: true,
              duracionHoras: true,
              modalidad: true,
              fechaInicio: true,
              fechaFin: true,
              proyecto: { select: { nombre: true, cliente: { select: { razonSocial: true } } } },
            },
          },
        },
      },
    },
  })

  if (!certificado) {
    return new Response("No encontrado", { status: 404 })
  }

  const asistente = certificado.asistente
  const cap = asistente.capacitacion
  const fechaEmision = new Date(certificado.fechaEmision).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const fechaInicio = new Date(cap.fechaInicio).toLocaleDateString("es-AR")
  const fechaFin = cap.fechaFin ? new Date(cap.fechaFin).toLocaleDateString("es-AR") : "En curso"

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Certificado de Capacitación - ${asistente.nombreAsistente}</title>
<style>
  @page { size: landscape; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 297mm;
    height: 210mm;
    font-family: 'Georgia', 'Times New Roman', serif;
    background: #fff;
    color: #1a1a2e;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .certificate {
    width: 277mm;
    height: 190mm;
    position: relative;
    border: 3px solid #1a1a2e;
    padding: 20mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .certificate::before {
    content: '';
    position: absolute;
    top: 4mm;
    left: 4mm;
    right: 4mm;
    bottom: 4mm;
    border: 1px solid #c4a35a;
    pointer-events: none;
  }
  .certificate::after {
    content: '';
    position: absolute;
    top: 7mm;
    left: 7mm;
    right: 7mm;
    bottom: 7mm;
    border: 1px solid #c4a35a;
    pointer-events: none;
  }
  .corner {
    position: absolute;
    width: 20mm;
    height: 20mm;
    border-color: #c4a35a;
    border-style: solid;
  }
  .corner-tl { top: 10mm; left: 10mm; border-width: 2px 0 0 2px; }
  .corner-tr { top: 10mm; right: 10mm; border-width: 2px 2px 0 0; }
  .corner-bl { bottom: 10mm; left: 10mm; border-width: 0 0 2px 2px; }
  .corner-br { bottom: 10mm; right: 10mm; border-width: 0 2px 2px 0; }
  .company-name {
    font-size: 14pt;
    letter-spacing: 4pt;
    text-transform: uppercase;
    color: #666;
    margin-bottom: 5mm;
    font-family: 'Arial', sans-serif;
  }
  .title {
    font-size: 32pt;
    font-weight: bold;
    color: #1a1a2e;
    margin-bottom: 3mm;
    letter-spacing: 2pt;
  }
  .subtitle {
    font-size: 12pt;
    color: #666;
    margin-bottom: 10mm;
    font-style: italic;
  }
  .divider {
    width: 60mm;
    height: 1px;
    background: #c4a35a;
    margin: 0 auto 8mm;
  }
  .recipient-label {
    font-size: 11pt;
    color: #888;
    margin-bottom: 2mm;
    text-transform: uppercase;
    letter-spacing: 2pt;
    font-family: 'Arial', sans-serif;
  }
  .recipient-name {
    font-size: 22pt;
    font-weight: bold;
    color: #1a1a2e;
    margin-bottom: 6mm;
    border-bottom: 1px solid #c4a35a;
    padding-bottom: 2mm;
    display: inline-block;
    min-width: 150mm;
  }
  .description {
    font-size: 11pt;
    color: #444;
    line-height: 1.8;
    max-width: 200mm;
    margin: 0 auto 8mm;
  }
  .details-table {
    margin: 0 auto 8mm;
    font-size: 10pt;
    font-family: 'Arial', sans-serif;
  }
  .details-table td {
    padding: 2mm 5mm;
    text-align: left;
  }
  .details-table td:first-child {
    font-weight: bold;
    color: #1a1a2e;
    text-align: right;
    padding-right: 3mm;
  }
  .details-table td:last-child {
    color: #444;
  }
  .footer-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
    margin-top: auto;
    padding-top: 8mm;
  }
  .signature-block {
    text-align: center;
    min-width: 60mm;
  }
  .signature-line {
    width: 50mm;
    border-top: 1px solid #1a1a2e;
    margin: 0 auto 2mm;
  }
  .signature-name {
    font-size: 9pt;
    font-weight: bold;
    color: #1a1a2e;
  }
  .signature-role {
    font-size: 8pt;
    color: #888;
    font-family: 'Arial', sans-serif;
  }
  .seal {
    width: 30mm;
    height: 30mm;
    border: 2px solid #c4a35a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    margin: 0 15mm;
  }
  .seal-text {
    font-size: 7pt;
    font-weight: bold;
    color: #c4a35a;
    text-transform: uppercase;
    letter-spacing: 1pt;
    font-family: 'Arial', sans-serif;
  }
  .seal-year {
    font-size: 10pt;
    font-weight: bold;
    color: #c4a35a;
  }
  .cert-code {
    position: absolute;
    bottom: 12mm;
    right: 14mm;
    font-size: 7pt;
    color: #aaa;
    font-family: 'Arial', sans-serif;
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <div class="certificate">
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <p class="company-name">LoBeMo Seguridad Informática</p>
    <h1 class="title">CERTIFICADO</h1>
    <p class="subtitle">de Capacitación en Ciberseguridad</p>
    <div class="divider"></div>

    <p class="recipient-label">Se certifica que</p>
    <h2 class="recipient-name">${asistente.nombreAsistente}</h2>

    <p class="description">
      ha completado satisfactoriamente el programa de capacitación
      <strong>"${cap.titulo}"</strong>
      con una carga horaria de <strong>${cap.duracionHoras} horas</strong>,
      ${asistente.evaluacion ? `obteniendo una calificación de <strong>${asistente.evaluacion}/10</strong>` : ""}.
    </p>

    <table class="details-table">
      <tr><td>Capacitación:</td><td>${cap.titulo}</td></tr>
      <tr><td>Modalidad:</td><td>${cap.modalidad === "PRESENCIAL" ? "Presencial" : "Remota"}</td></tr>
      <tr><td>Duración:</td><td>${cap.duracionHoras} horas</td></tr>
      <tr><td>Período:</td><td>${fechaInicio} — ${fechaFin}</td></tr>
      ${cap.proyecto ? `<tr><td>Proyecto:</td><td>${cap.proyecto.nombre}</td></tr>` : ""}
      ${cap.proyecto?.cliente ? `<tr><td>Cliente:</td><td>${cap.proyecto.cliente.razonSocial}</td></tr>` : ""}
      ${asistente.organizacion ? `<tr><td>Organización:</td><td>${asistente.organizacion}</td></tr>` : ""}
      <tr><td>Fecha de emisión:</td><td>${fechaEmision}</td></tr>
    </table>

    <div class="footer-section">
      <div class="signature-block">
        <div class="signature-line"></div>
        <p class="signature-name">Lic. Directora General</p>
        <p class="signature-role">LoBeMo Seguridad Informática</p>
      </div>

      <div class="seal">
        <span class="seal-text">LoBeMo</span>
        <span class="seal-year">${new Date().getFullYear()}</span>
        <span class="seal-text">Ciberseguridad</span>
      </div>

      <div class="signature-block">
        <div class="signature-line"></div>
        <p class="signature-name">Capacitador</p>
        <p class="signature-role">LoBeMo Seguridad Informística</p>
      </div>
    </div>

    <span class="cert-code">Código: ${certificado.codigoCertificado}</span>
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
