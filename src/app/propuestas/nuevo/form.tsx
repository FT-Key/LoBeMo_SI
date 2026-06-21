"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type ProyectoOption = {
  id: string
  nombre: string
  estado: string
  cliente: { razonSocial: string }
}

export function NuevaPropuestaForm({
  proyectos,
  proyectoIdInicial,
  recotizarId,
}: {
  proyectos: ProyectoOption[]
  proyectoIdInicial?: string
  recotizarId?: string
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    proyectoId: proyectoIdInicial ?? "",
    montoTotal: "",
    fechaEmision: new Date().toISOString().split("T")[0],
    fechaVencimiento: "",
  })
  const [detalles, setDetalles] = useState<Array<{ concepto: string; monto: string }>>([
    { concepto: "", monto: "" },
  ])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleDetalleChange(index: number, field: "concepto" | "monto", value: string) {
    setDetalles((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function addDetalle() {
    setDetalles((prev) => [...prev, { concepto: "", monto: "" }])
  }

  function removeDetalle(index: number) {
    if (detalles.length <= 1) return
    setDetalles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!form.proyectoId || !form.montoTotal || !form.fechaVencimiento) {
      setError("Proyecto, monto total y fecha de vencimiento son obligatorios")
      return
    }

    const detalleServicios = detalles
      .filter((d) => d.concepto && d.monto)
      .map((d) => ({ concepto: d.concepto, monto: parseFloat(d.monto) }))

    setSaving(true)
    try {
      const res = await fetch("/api/propuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          detalleServicios: detalleServicios.length > 0 ? detalleServicios : null,
          recotizarId: recotizarId || undefined,
        }),
      })

      if (res.ok) {
        router.push("/propuestas")
        router.refresh()
      } else {
        const json = await res.json()
        setError(json.error || "Error al crear la propuesta")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-500/15 border border-red-500/25 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Proyecto *</label>
        <select
          name="proyectoId"
          value={form.proyectoId}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Seleccionar proyecto</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} — {p.cliente.razonSocial} ({p.estado})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Monto total (ARS) *</label>
        <input
          name="montoTotal"
          type="number"
          step="0.01"
          value={form.montoTotal}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="0.00"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha de emisión</label>
          <input
            name="fechaEmision"
            type="date"
            value={form.fechaEmision}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha de vencimiento *</label>
          <input
            name="fechaVencimiento"
            type="date"
            value={form.fechaVencimiento}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">Detalle de servicios</label>
          <button
            type="button"
            onClick={addDetalle}
            className="text-xs text-primary hover:underline"
          >
            + Agregar ítem
          </button>
        </div>
        {detalles.map((d, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              placeholder="Concepto"
              value={d.concepto}
              onChange={(e) => handleDetalleChange(i, "concepto", e.target.value)}
              className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              placeholder="Monto"
              type="number"
              step="0.01"
              value={d.monto}
              onChange={(e) => handleDetalleChange(i, "monto", e.target.value)}
              className="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {detalles.length > 1 && (
              <button
                type="button"
                onClick={() => removeDetalle(i)}
                className="px-2 text-sm text-red-400 hover:underline"
              >
                X
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
        >
          {saving ? "Guardando..." : recotizarId ? "Crear recotización" : "Crear propuesta"}
        </button>
        <Link
          href="/propuestas"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input px-6 text-sm font-medium hover:bg-muted"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
