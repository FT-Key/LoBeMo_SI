"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Proyecto = { id: string; nombre: string }

export function CapacitacionForm({ proyectos }: { proyectos: Proyecto[] }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    proyectoId: "",
    titulo: "",
    temario: "",
    duracionHoras: "",
    modalidad: "PRESENCIAL",
    fechaInicio: "",
    fechaFin: "",
    materiales: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!form.titulo.trim()) {
      setError("El título es obligatorio")
      return
    }
    if (!form.temario.trim()) {
      setError("El temario es obligatorio")
      return
    }
    if (!form.duracionHoras || parseInt(form.duracionHoras) < 1) {
      setError("La duración debe ser al menos 1 hora")
      return
    }
    if (!form.fechaInicio) {
      setError("La fecha de inicio es obligatoria")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/capacitaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          proyectoId: form.proyectoId || null,
          duracionHoras: parseInt(form.duracionHoras),
          fechaFin: form.fechaFin || null,
          materiales: form.materiales.trim() || null,
        }),
      })

      if (res.ok) {
        const capacitacion = await res.json()
        router.push(`/capacitaciones/${capacitacion.id}`)
      } else {
        const json = await res.json()
        setError(json.error || "Error al crear la capacitación")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Título *</label>
        <input
          name="titulo"
          value={form.titulo}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Ej: Capacitación en OWASP Top 10"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Temario *</label>
        <textarea
          name="temario"
          value={form.temario}
          onChange={handleChange}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[120px]"
          placeholder="Describa el contenido de la capacitación..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Duración (horas) *</label>
          <input
            name="duracionHoras"
            type="number"
            min="1"
            value={form.duracionHoras}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="8"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Modalidad *</label>
          <select
            name="modalidad"
            value={form.modalidad}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="PRESENCIAL">Presencial</option>
            <option value="REMOTA">Remota</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha de inicio *</label>
          <input
            name="fechaInicio"
            type="date"
            value={form.fechaInicio}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha de finalización</label>
          <input
            name="fechaFin"
            type="date"
            value={form.fechaFin}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Proyecto asociado</label>
        <select
          name="proyectoId"
          value={form.proyectoId}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Sin proyecto asociado</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Materiales (URLs o referencias)</label>
        <textarea
          name="materiales"
          value={form.materiales}
          onChange={handleChange}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
          placeholder="Enlaces a materiales, documentos, presentaciones..."
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
        >
          {saving ? "Creando..." : "Crear capacitación"}
        </button>
        <Link
          href="/capacitaciones"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input px-6 text-sm font-medium hover:bg-muted"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
