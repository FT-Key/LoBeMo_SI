"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Empleado = { id: string; nombre: string; apellido: string }
type Proyecto = { id: string; nombre: string }

export function TicketForm({
  empleados,
  proyectos,
}: {
  empleados: Empleado[]
  proyectos: Proyecto[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "MEDIA",
    categoria: "CONSULTA",
    clienteNombre: "",
    proyectoId: "",
    asignadoAId: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    try {
      const res = await fetch("/api/soporte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          proyectoId: form.proyectoId || null,
          asignadoAId: form.asignadoAId || null,
        }),
      })

      if (res.ok) {
        const ticket = await res.json()
        router.push(`/soporte/${ticket.id}`)
      } else {
        const json = await res.json()
        setError(json.error || "Error al crear el ticket")
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
          placeholder="Ej: Problema con el firewall del cliente"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descripción</label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
          placeholder="Describa el incidente o solicitud..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Prioridad</label>
          <select
            name="prioridad"
            value={form.prioridad}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Crítica</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Categoría</label>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="CONSULTA">Consulta</option>
            <option value="INCIDENTE">Incidente</option>
            <option value="SOLICITUD">Solicitud</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Nombre del cliente (sin registro)</label>
        <input
          name="clienteNombre"
          value={form.clienteNombre}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Ej: Empresa ABC SRL"
        />
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
        <label className="text-sm font-medium">Asignar a técnico</label>
        <select
          name="asignadoAId"
          value={form.asignadoAId}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Sin asignar</option>
          {empleados.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
        >
          {saving ? "Creando..." : "Crear ticket"}
        </button>
        <Link
          href="/soporte"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input px-6 text-sm font-medium hover:bg-muted"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
