"use client"

import { useState, useEffect, useCallback } from "react"
import { Play, Square, Clock, Trash2 } from "lucide-react"

type RegistroHoras = {
  id: string
  inicio: string
  fin: string | null
  duracionMin: number
  descripcion: string | null
  empleadoId: string
}

type TimeTrackerProps = {
  tareaId: string
  sessionUserId: string
  registrosIniciales?: RegistroHoras[]
  readonly?: boolean
}

function formatearTiempo(segundos: number): string {
  const h = Math.floor(segundos / 3600)
  const m = Math.floor((segundos % 3600) / 60)
  const s = segundos % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

function formatearMinutos(minutos: number): string {
  if (minutos < 60) return `${minutos}min`
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function TimeTracker({ tareaId, sessionUserId, registrosIniciales = [], readonly }: TimeTrackerProps) {
  const [registros, setRegistros] = useState<RegistroHoras[]>(registrosIniciales)
  const [activo, setActivo] = useState<RegistroHoras | null>(null)
  const [segundos, setSegundos] = useState(0)
  const [creando, setCreando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState("")

  useEffect(() => {
    const activoExistente = registrosIniciales.find(
      (r) => r.empleadoId === sessionUserId && !r.fin
    )
    if (activoExistente) {
      setActivo(activoExistente)
      const inicio = new Date(activoExistente.inicio).getTime()
      setSegundos(Math.floor((Date.now() - inicio) / 1000))
    }
  }, [registrosIniciales, sessionUserId])

  useEffect(() => {
    if (!activo) return
    const interval = setInterval(() => {
      const inicio = new Date(activo.inicio).getTime()
      setSegundos(Math.floor((Date.now() - inicio) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [activo])

  const handleIniciar = useCallback(async () => {
    setCreando(true)
    try {
      const res = await fetch("/api/registro-horas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tareaId }),
      })
      if (res.ok) {
        const json = await res.json()
        setActivo(json.data)
        setRegistros((prev) => [json.data, ...prev])
      }
    } finally {
      setCreando(false)
    }
  }, [tareaId])

  const handleDetener = useCallback(async () => {
    if (!activo) return
    try {
      const res = await fetch(`/api/registro-horas/${activo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (res.ok) {
        const json = await res.json()
        setRegistros((prev) =>
          prev.map((r) => (r.id === activo.id ? json.data : r))
        )
        setActivo(null)
        setSegundos(0)
      }
    } finally {
      setActivo(null)
    }
  }, [activo])

  const handleEliminar = useCallback(async (id: string) => {
    setEliminandoId(id)
    try {
      const res = await fetch(`/api/registro-horas/${id}`, { method: "DELETE" })
      if (res.ok) {
        setRegistros((prev) => prev.filter((r) => r.id !== id))
      }
    } finally {
      setEliminandoId("")
    }
  }, [])

  const totalMinutos = registros
    .filter((r) => r.fin)
    .reduce((sum, r) => sum + r.duracionMin, 0)

  const registrosFinalizados = registros.filter((r) => r.fin)

  return (
    <div className="flex items-center gap-2">
      {activo ? (
        <>
          <span className="text-xs font-mono text-success animate-pulse">
            {formatearTiempo(segundos)}
          </span>
          <button
            onClick={handleDetener}
            className="inline-flex items-center gap-1 rounded-md bg-destructive/15 px-2 py-1 text-[10px] font-medium text-destructive hover:bg-destructive/25 transition-colors"
            title="Detener timer"
          >
            <Square className="size-3" />
            Detener
          </button>
        </>
      ) : (
        <>
          {totalMinutos > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {formatearMinutos(totalMinutos)}
            </span>
          )}
          {!readonly && (
            <button
              onClick={handleIniciar}
              disabled={creando}
              className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-1 text-[10px] font-medium text-success hover:bg-success/25 transition-colors disabled:opacity-50"
              title="Iniciar timer"
            >
              <Play className="size-3" />
              {creando ? "..." : "Iniciar"}
            </button>
          )}
        </>
      )}
    </div>
  )
}
