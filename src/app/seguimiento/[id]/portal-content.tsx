"use client"

import { useState } from "react"

type ProyectoData = {
  id: string
  nombre: string
  descripcion: string | null
  estado: string
  fechaInicio: string
  fechaEstimadaFin: string | null
  fechaEntregaReal: string | null
  createdAt: string
  cliente: { razonSocial: string; sector: string | null }
  servicio: { nombre: string; descripcion: string | null }
  historialEstados: { id: string; estadoAnterior: string | null; estadoNuevo: string; createdAt: string }[]
  hitos: { id: string; nombre: string; descripcion: string | null; fechaPrevista: string; fechaReal: string | null; completado: boolean }[]
  documentos: { id: string; nombreArchivo: string; tipo: string; createdAt: string }[]
  informesAuditoria: { id: string; alcance: string; criteriosAuditoria: string; hallazgos: unknown; noConformidades: unknown; observaciones: unknown; recomendaciones: unknown; fechaEmision: string | null; createdAt: string }[]
  hallazgosPentesting: { id: string; titulo: string; descripcion: string; severidad: string; evidencia: string | null; recomendacion: string | null; estado: string; createdAt: string }[]
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

const ESTADOS_COLORS: Record<string, string> = {
  RELEVAMIENTO: "bg-slate-500/15 text-slate-400 border-slate-500/25",
  PROPUESTA: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  APROBADO: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  EN_EJECUCION: "bg-[#00d4ff]/15 text-[#00d4ff] border-[#00d4ff]/25",
  EN_REVISION: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  ENTREGADO: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  CERRADO: "bg-green-500/15 text-green-400 border-green-500/25",
}

const SEVERIDAD_COLORS: Record<string, string> = {
  CRITICA: "bg-red-500/15 text-red-400 border-red-500/25",
  ALTA: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  MEDIA: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  BAJA: "bg-slate-500/15 text-slate-400 border-slate-500/25",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String)
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch { /* ignore */ }
  }
  return []
}

export function PortalContent({ proyecto }: { proyecto: ProyectoData }) {
  const [activeTab, setActiveTab] = useState<"resumen" | "timeline" | "hitos" | "documentos" | "auditoria" | "pentesting">("resumen")

  const hitosCompletados = proyecto.hitos.filter((h) => h.completado).length
  const totalHitos = proyecto.hitos.length
  const progreso = totalHitos > 0 ? Math.round((hitosCompletados / totalHitos) * 100) : 0

  const tabs = [
    { id: "resumen" as const, label: "Resumen" },
    { id: "timeline" as const, label: "Timeline" },
    { id: "hitos" as const, label: "Hitos" },
    { id: "documentos" as const, label: "Documentos" },
    ...(proyecto.informesAuditoria.length > 0 ? [{ id: "auditoria" as const, label: "Auditoría" }] : []),
    ...(proyecto.hallazgosPentesting.length > 0 ? [{ id: "pentesting" as const, label: "Pentesting" }] : []),
  ]

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <header className="border-b border-[#1e293b] bg-[#0f172a]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0090ff] flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">LoBeMo Seguridad</span>
          </div>
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${ESTADOS_COLORS[proyecto.estado] || "bg-slate-500/15 text-slate-400 border-slate-500/25"}`}>
            {ESTADOS_LABELS[proyecto.estado] || proyecto.estado}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-[#64748b] text-xs uppercase tracking-wider mb-1">Proyecto</p>
          <h1 className="text-2xl font-bold text-white mb-2">{proyecto.nombre}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-[#94a3b8]">
            <span>Cliente: <strong className="text-[#e2e8f0]">{proyecto.cliente.razonSocial}</strong></span>
            <span>Servicio: <strong className="text-[#e2e8f0]">{proyecto.servicio.nombre}</strong></span>
            <span>Inicio: <strong className="text-[#e2e8f0]">{formatDate(proyecto.fechaInicio)}</strong></span>
            {proyecto.fechaEstimadaFin && (
              <span>Estimado: <strong className="text-[#e2e8f0]">{formatDate(proyecto.fechaEstimadaFin)}</strong></span>
            )}
          </div>
          {proyecto.descripcion && (
            <p className="text-[#94a3b8] text-sm mt-3">{proyecto.descripcion}</p>
          )}
        </div>

        <nav className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/25"
                  : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "resumen" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Progreso</h3>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-3xl font-bold text-[#00d4ff]">{progreso}%</span>
                <span className="text-sm text-[#94a3b8] mb-1">{hitosCompletados}/{totalHitos} hitos</span>
              </div>
              <div className="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00d4ff] to-[#0090ff] rounded-full transition-all" style={{ width: `${progreso}%` }} />
              </div>
            </div>

            <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Resumen</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Documentos</span>
                  <span className="text-white font-medium">{proyecto.documentos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Informe de Auditoría</span>
                  <span className="text-white font-medium">{proyecto.informesAuditoria.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Hallazgos de Pentesting</span>
                  <span className="text-white font-medium">{proyecto.hallazgosPentesting.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 md:col-span-2">
              <h3 className="text-sm font-semibold text-white mb-4">Timeline reciente</h3>
              {proyecto.historialEstados.length === 0 ? (
                <p className="text-[#475569] text-sm">Sin cambios de estado registrados</p>
              ) : (
                <div className="space-y-3">
                  {proyecto.historialEstados.slice(-5).reverse().map((h) => (
                    <div key={h.id} className="flex items-center gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-[#00d4ff] flex-shrink-0" />
                      <span className="text-[#94a3b8]">{formatDateTime(h.createdAt)}</span>
                      {h.estadoAnterior && <span className="text-[#64748b]">{ESTADOS_LABELS[h.estadoAnterior] || h.estadoAnterior}</span>}
                      {h.estadoAnterior && <span className="text-[#00d4ff]">→</span>}
                      <span className="text-white font-medium">{ESTADOS_LABELS[h.estadoNuevo] || h.estadoNuevo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-[#1e293b]" />
            <div className="space-y-6">
              {proyecto.historialEstados.map((h, i) => (
                <div key={h.id} className="relative pl-10">
                  <div className={`absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 ${i === proyecto.historialEstados.length - 1 ? "bg-[#00d4ff] border-[#00d4ff]" : "bg-[#0a0a1a] border-[#1e293b]"}`} />
                  <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {h.estadoAnterior && (
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${ESTADOS_COLORS[h.estadoAnterior] || "bg-slate-500/15 text-slate-400 border-slate-500/25"}`}>
                          {ESTADOS_LABELS[h.estadoAnterior] || h.estadoAnterior}
                        </span>
                      )}
                      {h.estadoAnterior && <span className="text-[#00d4ff] text-xs">→</span>}
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${ESTADOS_COLORS[h.estadoNuevo] || "bg-slate-500/15 text-slate-400 border-slate-500/25"}`}>
                        {ESTADOS_LABELS[h.estadoNuevo] || h.estadoNuevo}
                      </span>
                    </div>
                    <p className="text-[#64748b] text-xs mt-1">{formatDateTime(h.createdAt)}</p>
                  </div>
                </div>
              ))}
              {proyecto.historialEstados.length === 0 && (
                <p className="text-[#475569] text-sm pl-10">Sin cambios de estado registrados</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "hitos" && (
          <div className="space-y-4">
            {proyecto.hitos.length === 0 ? (
              <p className="text-[#475569] text-sm">No hay hitos registrados</p>
            ) : (
              proyecto.hitos.map((h) => (
                <div key={h.id} className={`bg-[#111827] border rounded-xl p-4 ${h.completado ? "border-emerald-500/25" : "border-[#1e293b]"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white">{h.nombre}</h4>
                        {h.completado && (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 text-xs font-semibold">Completado</span>
                        )}
                      </div>
                      {h.descripcion && <p className="text-[#94a3b8] text-xs mt-1">{h.descripcion}</p>}
                    </div>
                    <div className="text-right text-xs text-[#64748b] flex-shrink-0">
                      <div>Previsto: {formatDate(h.fechaPrevista)}</div>
                      {h.fechaReal && <div className="text-emerald-400">Real: {formatDate(h.fechaReal)}</div>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "documentos" && (
          <div className="space-y-3">
            {proyecto.documentos.length === 0 ? (
              <p className="text-[#475569] text-sm">No hay documentos disponibles</p>
            ) : (
              proyecto.documentos.map((d) => (
                <a
                  key={d.id}
                  href={`/api/portal/documento/${d.id}`}
                  className="flex items-center gap-4 bg-[#111827] border border-[#1e293b] rounded-xl p-4 hover:border-[#00d4ff]/25 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-[#1e293b] flex items-center justify-center flex-shrink-0">
                    <svg className="h-5 w-5 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{d.nombreArchivo}</p>
                    <p className="text-xs text-[#64748b]">{d.tipo} · {formatDate(d.createdAt)}</p>
                  </div>
                  <svg className="h-5 w-5 text-[#475569] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              ))
            )}
          </div>
        )}

        {activeTab === "auditoria" && (
          <div className="space-y-6">
            {proyecto.informesAuditoria.map((inf) => (
              <div key={inf.id} className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden">
                <div className="p-6 border-b border-[#1e293b]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-white">Informe de Auditoría</h3>
                    {inf.fechaEmision && (
                      <span className="text-xs text-[#64748b]">Emitido: {formatDate(inf.fechaEmision)}</span>
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="text-[#94a3b8]"><strong className="text-[#e2e8f0]">Alcance:</strong> {inf.alcance}</p>
                    <p className="text-[#94a3b8] mt-1"><strong className="text-[#e2e8f0]">Criterios:</strong> {inf.criteriosAuditoria}</p>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {parseJsonArray(inf.hallazgos).length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Hallazgos</h4>
                      <ul className="space-y-1">
                        {parseJsonArray(inf.hallazgos).map((h, i) => (
                          <li key={i} className="text-sm text-[#e2e8f0] flex items-start gap-2">
                            <span className="text-[#00d4ff] mt-1">•</span>{h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {parseJsonArray(inf.noConformidades).length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">No Conformidades</h4>
                      <ul className="space-y-1">
                        {parseJsonArray(inf.noConformidades).map((nc, i) => (
                          <li key={i} className="text-sm text-[#e2e8f0] flex items-start gap-2">
                            <span className="text-red-400 mt-1">•</span>{nc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {parseJsonArray(inf.recomendaciones).length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Recomendaciones</h4>
                      <ul className="space-y-1">
                        {parseJsonArray(inf.recomendaciones).map((r, i) => (
                          <li key={i} className="text-sm text-[#e2e8f0] flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span>{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "pentesting" && (
          <div className="space-y-4">
            {proyecto.hallazgosPentesting.map((h) => (
              <div key={h.id} className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{h.titulo}</h4>
                    <p className="text-xs text-[#64748b] mt-0.5">{formatDateTime(h.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${SEVERIDAD_COLORS[h.severidad] || "bg-slate-500/15 text-slate-400 border-slate-500/25"}`}>
                      {h.severidad}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-[#1e293b] px-2 py-0.5 text-xs text-[#94a3b8]">
                      {h.estado}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-[#94a3b8] mb-3">{h.descripcion}</p>
                {h.evidencia && (
                  <div className="bg-[#0f172a] rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-[#64748b] uppercase mb-1">Evidencia</p>
                    <p className="text-sm text-[#e2e8f0]">{h.evidencia}</p>
                  </div>
                )}
                {h.recomendacion && (
                  <div className="bg-[#0f172a] rounded-lg p-3">
                    <p className="text-xs font-semibold text-[#64748b] uppercase mb-1">Recomendación</p>
                    <p className="text-sm text-[#e2e8f0]">{h.recomendacion}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[#1e293b] mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="text-[#475569] text-xs">LoBeMo Seguridad Informática · Portal de Seguimiento</p>
        </div>
      </footer>
    </div>
  )
}
