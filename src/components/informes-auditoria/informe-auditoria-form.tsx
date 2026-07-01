"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Proyecto = { id: string; nombre: string }

export function InformeAuditoriaForm({ proyectos }: { proyectos: Proyecto[] }) {
  const router = useRouter()
  const [proyectoId, setProyectoId] = useState("")
  const [alcance, setAlcance] = useState("")
  const [criteriosAuditoria, setCriteriosAuditoria] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!proyectoId) {
      setError("Debe seleccionar un proyecto")
      setLoading(false)
      return
    }

    if (!alcance.trim()) {
      setError("El alcance no puede estar vacío")
      setLoading(false)
      return
    }

    if (!criteriosAuditoria.trim()) {
      setError("Los criterios de auditoría no pueden estar vacíos")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/informes-auditoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proyectoId, alcance: alcance.trim(), criteriosAuditoria: criteriosAuditoria.trim() }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al crear el informe")
        setLoading(false)
        return
      }

      const informe = await res.json()
      router.push(`/informes-auditoria/${informe.id}`)
    } catch {
      setError("Error de conexión")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 rounded-md bg-red-500/15 text-red-400 border border-red-500/25 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Proyecto *</label>
        <select
          value={proyectoId}
          onChange={(e) => setProyectoId(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="">Seleccionar proyecto...</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">Solo proyectos de tipo Auditoría ISO 27001</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Alcance de la auditoría *</label>
        <textarea
          value={alcance}
          onChange={(e) => setAlcance(e.target.value)}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
          placeholder="Describa el alcance de la auditoría..."
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Criterios de auditoría *</label>
        <textarea
          value={criteriosAuditoria}
          onChange={(e) => setCriteriosAuditoria(e.target.value)}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
          placeholder="Describa los criterios utilizados para la auditoría..."
          required
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
        >
          {loading ? "Creando..." : "Crear informe"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-10 items-center justify-center rounded-md border border-input px-6 text-sm font-medium hover:bg-muted"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
