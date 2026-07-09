"use client"

import { useState, useEffect } from "react"
import { Calendario } from "@/components/calendario/calendario"

type Evento = {
  id: string
  tipo: "hito" | "vencimiento"
  titulo: string
  fecha: string
  completado?: boolean
  estado?: string
  proyecto: { id: string; nombre: string }
}

export function CalendarioView() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/calendario")
      .then((r) => (r.ok ? r.json() : Promise.reject("Error")))
      .then((d) => {
        setEventos(d.eventos)
        setLoading(false)
      })
      .catch(() => {
        setError("Error al cargar eventos")
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p className="text-muted-foreground">Cargando calendario...</p>
  }

  if (error) {
    return <div className="p-3 rounded-md bg-red-500/15 text-red-400 border border-red-500/25 text-sm">{error}</div>
  }

  return <Calendario eventos={eventos} />
}
