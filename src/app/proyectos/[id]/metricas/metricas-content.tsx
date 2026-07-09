"use client"

import { useState, useEffect } from "react"
import { BarChart, ProgressBar } from "@/components/metricas/bar-chart"

type MetricasData = {
  proyecto: { id: string; nombre: string; estado: string }
  tareas: {
    total: number
    completadas: number
    pendientes: number
    porcentajeAvance: number
    porEstado: Record<string, number>
    porPrioridad: Record<string, number>
  }
  hitos: {
    total: number
    completados: number
    pendientes: number
    porcentaje: number
  }
  asignaciones: {
    id: string
    empleado: string
    rol: string
    tareasCount: number
  }[]
}

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendientes",
  EN_PROGRESO: "En progreso",
  COMPLETADA: "Completadas",
  CANCELADA: "Canceladas",
}

const PRIORIDAD_LABELS: Record<string, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  CRITICA: "Crítica",
}

export function MetricasProyecto({ proyectoId }: { proyectoId: string }) {
  const [data, setData] = useState<MetricasData | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/metricas/proyecto/${proyectoId}`)
      .then((r) => r.ok ? r.json() : Promise.reject("Error"))
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => { setError("Error al cargar métricas"); setLoading(false) })
  }, [proyectoId])

  if (loading) {
    return <p className="text-muted-foreground">Cargando métricas...</p>
  }

  if (error) {
    return <div className="p-3 rounded-md bg-red-500/15 text-red-400 border border-red-500/25 text-sm">{error}</div>
  }

  if (!data) return null

  const tareasPorEstadoLabels = Object.fromEntries(
    Object.entries(data.tareas.porEstado).map(([k, v]) => [ESTADO_LABELS[k] ?? k, v])
  )
  const tareasPorPrioridadLabels = Object.fromEntries(
    Object.entries(data.tareas.porPrioridad).map(([k, v]) => [PRIORIDAD_LABELS[k] ?? k, v])
  )

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-3xl font-bold">{data.tareas.total}</p>
          <p className="text-sm text-muted-foreground">Total tareas</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-3xl font-bold text-green-400">{data.tareas.completadas}</p>
          <p className="text-sm text-muted-foreground">Completadas</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-3xl font-bold text-yellow-400">{data.tareas.pendientes}</p>
          <p className="text-sm text-muted-foreground">Pendientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-surface p-5 space-y-6">
          <ProgressBar
            value={data.tareas.porcentajeAvance}
            label="Avance de tareas"
            color="bg-green-500"
          />
          <ProgressBar
            value={data.hitos.porcentaje}
            label="Hitos completados"
            color="bg-blue-500"
          />
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{data.hitos.completados}</p>
              <p className="text-xs text-muted-foreground">Hitos cumplidos</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{data.hitos.pendientes}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-surface p-5">
          <BarChart data={tareasPorEstadoLabels} title="Tareas por estado" />
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <BarChart data={tareasPorPrioridadLabels} title="Tareas por prioridad" />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Equipo asignado ({data.asignaciones.length})
        </h3>
        <div className="space-y-2">
          {data.asignaciones.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium">{a.empleado}</p>
                <p className="text-xs text-muted-foreground">{a.rol.replace(/_/g, " ")}</p>
              </div>
              <span className="text-sm text-muted-foreground">{a.tareasCount} tareas</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
