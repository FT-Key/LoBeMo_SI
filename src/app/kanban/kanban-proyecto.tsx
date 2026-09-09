"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { KanbanBoard } from "@/components/tareas/kanban-board"
import { Loader2 } from "lucide-react"

type Proyecto = { id: string; nombre: string; estado: string }
type Tarea = {
  id: string
  titulo: string
  descripcion?: string | null
  estado: string
  prioridad: string
  orden: number
  fechaLimite?: string | null
  asignacion?: { empleado: { nombre: string; apellido: string } } | null
}

export function KanbanProyecto({ proyectos }: { proyectos: Proyecto[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialId = searchParams.get("proyecto") || ""
  const [selectedId, setSelectedId] = useState(initialId)
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedId) { setTareas([]); return }
    setLoading(true)
    fetch(`/api/proyectos/${selectedId}/tareas`)
      .then(r => r.json())
      .then(data => { setTareas(data.tareas || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selectedId])

  const handleChange = (id: string) => {
    setSelectedId(id)
    const params = new URLSearchParams()
    if (id) params.set("proyecto", id)
    router.replace(`/kanban${id ? `?${params}` : ""}`)
  }

  const handleMoveTarea = async (tareaId: string, nuevoEstado: string, nuevoOrden: number) => {
    setTareas(prev => prev.map(t => t.id === tareaId ? { ...t, estado: nuevoEstado, orden: nuevoOrden } : t))
    await fetch(`/api/tareas/${tareaId}/mover`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado, orden: nuevoOrden }),
    })
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
        <p className="text-sm text-muted-foreground py-10 text-center">Este proyecto no tiene tareas.</p>
      )}

      {!loading && tareas.length > 0 && (
        <KanbanBoard tareas={tareas} onMoveTarea={handleMoveTarea} />
      )}
    </div>
  )
}
