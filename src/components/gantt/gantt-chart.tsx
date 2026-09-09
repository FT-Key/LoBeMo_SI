"use client"

import { useMemo } from "react"
import { GanttRow, type GanttTarea } from "./gantt-row"

export type GanttHito = {
  id: string
  nombre: string
  fechaPrevista: string | Date
  completado: boolean
}

type GanttChartProps = {
  tareas: GanttTarea[]
  hitos: GanttHito[]
  fechaInicioProyecto: string | Date
  fechaEstimadaFin?: string | Date | null
}

const DAY_MS = 24 * 60 * 60 * 1000

function toMs(value: string | Date): number {
  return new Date(value).getTime()
}

export function GanttChart({ tareas, hitos, fechaInicioProyecto, fechaEstimadaFin }: GanttChartProps) {
  const { rangeStart, rangeEnd, days } = useMemo(() => {
    const points: number[] = [toMs(fechaInicioProyecto)]
    if (fechaEstimadaFin) points.push(toMs(fechaEstimadaFin))
    for (const t of tareas) {
      points.push(toMs(t.createdAt))
      if (t.fechaLimite) points.push(toMs(t.fechaLimite))
    }
    for (const h of hitos) points.push(toMs(h.fechaPrevista))
    const valid = points.filter((n) => Number.isFinite(n))
    const fallback = toMs(fechaInicioProyecto)
    const safeFallback = Number.isFinite(fallback) ? fallback : 0
    let start = valid.length > 0 ? Math.min(...valid) : safeFallback
    let end = valid.length > 0 ? Math.max(...valid) : safeFallback + 14 * DAY_MS
    start -= 2 * DAY_MS
    end += 2 * DAY_MS
    if (end - start < 14 * DAY_MS) end = start + 14 * DAY_MS
    const totalDays = Math.max(1, Math.ceil((end - start) / DAY_MS))
    return { rangeStart: start, rangeEnd: end, days: totalDays }
  }, [tareas, hitos, fechaInicioProyecto, fechaEstimadaFin])

  const rangeMs = rangeEnd - rangeStart
  const tickEvery = days > 90 ? 14 : days > 45 ? 7 : days > 21 ? 3 : 1
  const ticks = useMemo(() => {
    const list: { date: Date; offset: number }[] = []
    for (let d = 0; d <= days; d += tickEvery) {
      list.push({ date: new Date(rangeStart + d * DAY_MS), offset: (d / days) * 100 })
    }
    return list
  }, [days, rangeStart, tickEvery])

  const labelWidth = Math.max(days * 28, 640)

  if (tareas.length === 0 && hitos.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin tareas ni hitos para mostrar en el timeline.</p>
  }

  return (
    <div className="space-y-4">
      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-yellow-500/70" /> Pendiente
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-blue-500/70" /> En progreso
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-green-500/70" /> Completada
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-gray-500/50" /> Cancelada
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2.5 rotate-45 bg-purple-400" /> Hito
        </span>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <div className="min-w-full" style={{ minWidth: labelWidth }}>
          {/* Escala temporal */}
          <div className="relative ml-52 h-10 border-b bg-muted/20">
            {ticks.map((tick, i) => (
              <span
                key={i}
                className="absolute top-2 -translate-x-1/2 text-xs text-muted-foreground"
                style={{ left: `${tick.offset}%` }}
              >
                {tick.date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
              </span>
            ))}
          </div>

          {/* Filas de tareas */}
          {tareas.map((tarea) => (
            <div key={tarea.id} className="flex items-center border-b last:border-0">
              <div className="w-52 shrink-0 truncate px-3 py-2 text-sm font-medium" title={tarea.titulo}>
                {tarea.titulo}
              </div>
              <div className="relative flex-1">
                <GanttRow tarea={tarea} rangeStartMs={rangeStart} rangeMs={rangeMs} />
              </div>
            </div>
          ))}

          {/* Carril de hitos */}
          {hitos.length > 0 && (
            <div className="flex items-center bg-purple-500/5">
              <div className="w-52 shrink-0 px-3 py-2 text-sm font-medium text-purple-300">
                Hitos ({hitos.length})
              </div>
              <div className="relative h-10 flex-1">
                {hitos.map((hito) => {
                  const offset = ((toMs(hito.fechaPrevista) - rangeStart) / (rangeMs || 1)) * 100
                  if (offset < 0 || offset > 100) return null
                  return (
                    <span
                      key={hito.id}
                      className={`absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] ${
                        hito.completado ? "bg-green-400" : "bg-purple-400"
                      }`}
                      style={{ left: `${offset}%` }}
                      title={`${hito.nombre} — ${new Date(hito.fechaPrevista).toLocaleDateString("es-AR")}${hito.completado ? " (completado)" : ""}`}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de hitos con fecha */}
      {hitos.length > 0 && (
        <ul className="space-y-1 text-xs text-muted-foreground">
          {hitos.map((hito) => (
            <li key={hito.id} className="flex items-center gap-2">
              <span
                className={`inline-block size-2.5 rotate-45 rounded-[2px] ${hito.completado ? "bg-green-400" : "bg-purple-400"}`}
              />
              <span className="font-medium text-foreground">{hito.nombre}</span>
              <span>{new Date(hito.fechaPrevista).toLocaleDateString("es-AR")}</span>
              {hito.completado && <span className="text-green-400">✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
