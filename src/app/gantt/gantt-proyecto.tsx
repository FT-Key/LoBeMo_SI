"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { GanttChart } from "@/components/gantt/gantt-chart"
import type { GanttTarea } from "@/components/gantt/gantt-row"
import type { GanttHito } from "@/components/gantt/gantt-chart"
import { Loader2 } from "lucide-react"

type Proyecto = { id: string; nombre: string; estado: string }

export function GanttProyecto({ proyectos }: { proyectos: Proyecto[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialId = searchParams.get("proyecto") || ""
  const [selectedId, setSelectedId] = useState(initialId)
  const [tareas, setTareas] = useState<GanttTarea[]>([])
  const [hitos, setHitos] = useState<GanttHito[]>([])
  const [fechaInicio, setFechaInicio] = useState<string | Date>(new Date())
  const [fechaFin, setFechaFin] = useState<string | Date | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedId) { setTareas([]); setHitos([]); return }
    setLoading(true)
    fetch(`/api/proyectos/${selectedId}/gantt`)
      .then(r => r.json())
      .then(data => {
        setTareas(data.tareas || [])
        setHitos(data.hitos || [])
        setFechaInicio(data.fechaInicio ? new Date(data.fechaInicio) : new Date())
        setFechaFin(data.fechaEstimadaFin ? new Date(data.fechaEstimadaFin) : null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedId])

  const handleChange = (id: string) => {
    setSelectedId(id)
    const params = new URLSearchParams()
    if (id) params.set("proyecto", id)
    router.replace(`/gantt${id ? `?${params}` : ""}`)
  }

  return (
    <div>
      <div className="mb-4">
        <select
          value={selectedId}
          onChange={e => handleChange(e.target.value)}
          className="w-full max-w-md px-3 py-2 rounded-lg border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">— Seleccionar proyecto —</option>
          {proyectos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre} ({p.estado.replace(/_/g, " ")})</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && selectedId && tareas.length === 0 && (
        <p className="text-sm text-muted-foreground py-10 text-center">Este proyecto no tiene tareas para mostrar en el cronograma.</p>
      )}

      {!loading && tareas.length > 0 && (
        <div className="rounded-lg border bg-surface-elevated/80 p-6">
          <GanttChart
            tareas={tareas}
            hitos={hitos}
            fechaInicioProyecto={fechaInicio}
            fechaEstimadaFin={fechaFin}
          />
        </div>
      )}
    </div>
  )
}
