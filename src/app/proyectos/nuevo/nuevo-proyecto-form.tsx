"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function NuevoProyectoForm({
  clientes,
  servicios,
}: {
  clientes: { id: string; razonSocial: string }[]
  servicios: { id: string; nombre: string }[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    clienteId: "",
    servicioId: "",
    fechaEstimadaFin: "",
    montoAcordado: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!form.nombre || !form.clienteId || !form.servicioId) {
      setError("Nombre, cliente y servicio son obligatorios")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/proyectos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        router.push("/proyectos")
        router.refresh()
      } else {
        const json = await res.json()
        setError(json.error || "Error al crear el proyecto")
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
        <label className="text-sm font-medium">Nombre del proyecto *</label>
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Ej: Auditoría ISO 27001 - Cliente X"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descripción</label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
          placeholder="Descripción del proyecto..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Cliente *</label>
        <select
          name="clienteId"
          value={form.clienteId}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Seleccionar cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.razonSocial}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Servicio *</label>
        <select
          name="servicioId"
          value={form.servicioId}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Seleccionar servicio</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Fecha estimada de finalización</label>
        <input
          name="fechaEstimadaFin"
          type="date"
          value={form.fechaEstimadaFin}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Monto acordado (ARS)</label>
        <input
          name="montoAcordado"
          type="number"
          step="0.01"
          value={form.montoAcordado}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="0.00"
        />
      </div>

      <button type="submit" disabled={saving} className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50">
        {saving ? "Guardando..." : "Crear proyecto"}
      </button>
    </form>
  )
}
