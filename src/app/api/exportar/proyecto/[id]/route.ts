import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

const ESTADO_LABELS: Record<string, string> = {
  RELEVAMIENTO: "Relevamiento",
  PROPUESTA: "Propuesta",
  APROBADO: "Aprobado",
  EN_EJECUCION: "En Ejecución",
  EN_REVISION: "En Revisión",
  ENTREGADO: "Entregado",
  CERRADO: "Cerrado",
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return new Response("No autorizado", { status: 403 })
  }

  const { id } = await params

  const proyecto = await prisma.proyecto.findUnique({
    where: { id },
    include: {
      cliente: { select: { razonSocial: true, cuit: true, emailContacto: true, telefono: true } },
      servicio: { select: { nombre: true } },
      tareas: {
        orderBy: { createdAt: "desc" },
        include: {
          asignacion: {
            include: {
              empleado: { select: { nombre: true, apellido: true } },
            },
          },
        },
      },
      asignaciones: {
        include: {
          empleado: { select: { nombre: true, apellido: true, rol: true } },
        },
      },
      hitos: { orderBy: { fechaPrevista: "asc" } },
    },
  })

  if (!proyecto) {
    return new Response("No encontrado", { status: 404 })
  }

  const totalTareas = proyecto.tareas.length
  const completadas = proyecto.tareas.filter((t) => t.estado === "COMPLETADA").length
  const enProgreso = proyecto.tareas.filter((t) => t.estado === "EN_PROGRESO").length
  const pendientes = proyecto.tareas.filter((t) => t.estado === "PENDIENTE").length
  const porcentaje = totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0

  const TAREA_ESTADO_BADGES: Record<string, string> = {
    PENDIENTE: "#ca8a04",
    EN_PROGRESO: "#2563eb",
    COMPLETADA: "#16a34a",
    CANCELADA: "#6b7280",
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Proyecto - ${proyecto.nombre}</title>
<style>
  @page { margin: 20mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; line-height: 1.6; font-size: 11pt; }
  h1 { font-size: 18pt; border-bottom: 2px solid #1a1a2e; padding-bottom: 4pt; margin-top: 0; }
  h2 { font-size: 14pt; color: #16213e; margin-top: 20pt; }
  h3 { font-size: 12pt; color: #0f3460; margin-top: 14pt; }
  table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
  th { background-color: #1a1a2e; color: #fff; padding: 6pt 8pt; text-align: left; font-size: 10pt; }
  td { padding: 6pt 8pt; border-bottom: 1px solid #ddd; font-size: 10pt; }
  .section { border: 1px solid #e5e7eb; border-radius: 4pt; padding: 10pt; margin: 10pt 0; }
  .progress-bg { background: #e5e7eb; border-radius: 4pt; height: 14pt; overflow: hidden; }
  .progress-fill { background: #16a34a; height: 100%; border-radius: 4pt; }
  .stat-box { display: inline-block; text-align: center; padding: 8pt 16pt; margin: 4pt; border: 1px solid #e5e7eb; border-radius: 4pt; min-width: 80pt; }
  .stat-box .num { font-size: 18pt; font-weight: bold; }
  .stat-box .label { font-size: 8pt; color: #666; text-transform: uppercase; }
  .badge { display: inline-block; padding: 2pt 8pt; border-radius: 3pt; font-size: 9pt; font-weight: bold; color: #fff; }
  .footer { margin-top: 30pt; padding-top: 10pt; border-top: 1px solid #ccc; font-size: 9pt; color: #666; text-align: center; }
  .checked { color: #16a34a; }
  .unchecked { color: #ca8a04; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <div style="text-align:center;margin-bottom:20pt">
    <h1 style="border:none">LoBeMo Seguridad Informática</h1>
    <p style="font-size:10pt;color:#666">Reporte de Estado del Proyecto</p>
  </div>

  <table>
    <tr><th style="width:30%">Campo</th><th>Detalle</th></tr>
    <tr><td>Nombre del proyecto</td><td>${proyecto.nombre}</td></tr>
    <tr><td>Cliente</td><td>${proyecto.cliente.razonSocial} (CUIT: ${proyecto.cliente.cuit})</td></tr>
    <tr><td>Servicio</td><td>${proyecto.servicio.nombre.replace(/_/g, " ")}</td></tr>
    <tr><td>Estado</td><td>${ESTADO_LABELS[proyecto.estado] ?? proyecto.estado}</td></tr>
    <tr><td>Fecha de inicio</td><td>${new Date(proyecto.fechaInicio).toLocaleDateString("es-AR")}</td></tr>
    <tr><td>Fecha estimada de fin</td><td>${proyecto.fechaEstimadaFin ? new Date(proyecto.fechaEstimadaFin).toLocaleDateString("es-AR") : "—"}</td></tr>
    <tr><td>Monto acordado</td><td>${proyecto.montoAcordado ? `$${Number(proyecto.montoAcordado).toLocaleString("es-AR")}` : "—"}</td></tr>
  </table>

  <h2>Avance del Proyecto</h2>
  <div style="text-align:center;margin:10pt 0">
    <div class="stat-box"><div class="num">${totalTareas}</div><div class="label">Total tareas</div></div>
    <div class="stat-box"><div class="num" style="color:#16a34a">${completadas}</div><div class="label">Completadas</div></div>
    <div class="stat-box"><div class="num" style="color:#2563eb">${enProgreso}</div><div class="label">En progreso</div></div>
    <div class="stat-box"><div class="num" style="color:#ca8a04">${pendientes}</div><div class="label">Pendientes</div></div>
  </div>
  <div class="progress-bg"><div class="progress-fill" style="width:${porcentaje}%"></div></div>
  <p style="text-align:right;font-size:10pt;font-weight:bold">${porcentaje}% completado</p>

  <h2>Equipo del Proyecto</h2>
  <table>
    <tr><th>Nombre</th><th>Rol</th></tr>
    ${proyecto.asignaciones.map((a) => `<tr><td>${a.empleado.nombre} ${a.empleado.apellido}</td><td>${a.empleado.rol.replace(/_/g, " ")}</td></tr>`).join("")}
    ${proyecto.asignaciones.length === 0 ? "<tr><td colspan='2' style='text-align:center;color:#666'>Sin asignaciones</td></tr>" : ""}
  </table>

  <h2>Tareas</h2>
  <table>
    <tr><th>Título</th><th>Estado</th><th>Prioridad</th><th>Asignado</th></tr>
    ${proyecto.tareas.map((t) => `
      <tr>
        <td>${t.titulo}</td>
        <td><span class="badge" style="background:${TAREA_ESTADO_BADGES[t.estado] ?? "#6b7280"}">${t.estado.replace(/_/g, " ")}</span></td>
        <td>${t.prioridad}</td>
        <td>${t.asignacion?.empleado ? `${t.asignacion.empleado.nombre} ${t.asignacion.empleado.apellido}` : "—"}</td>
      </tr>`).join("")}
    ${proyecto.tareas.length === 0 ? "<tr><td colspan='4' style='text-align:center;color:#666'>Sin tareas registradas</td></tr>" : ""}
  </table>

  <h2>Hitos</h2>
  <table>
    <tr><th>Hito</th><th>Fecha prevista</th><th>Estado</th></tr>
    ${proyecto.hitos.map((h) => `
      <tr>
        <td>${h.nombre}</td>
        <td>${new Date(h.fechaPrevista).toLocaleDateString("es-AR")}</td>
        <td class="${h.completado ? "checked" : "unchecked"}">${h.completado ? "✓ Completado" : "○ Pendiente"}</td>
      </tr>`).join("")}
    ${proyecto.hitos.length === 0 ? "<tr><td colspan='3' style='text-align:center;color:#666'>Sin hitos registrados</td></tr>" : ""}
  </table>

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
