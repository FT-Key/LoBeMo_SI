"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { createPropuestaSchema } from "@/shared/validation"

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
  const [detalles, setDetalles] = useState<Array<{ concepto: string; monto: string }>>([
    { concepto: "", monto: "" },
  ])
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(createPropuestaSchema),
    defaultValues: {
      proyectoId: proyectoIdInicial ?? "",
      montoTotal: undefined as unknown as number,
      fechaEmision: new Date().toISOString().split("T")[0],
      fechaVencimiento: "",
    },
  })

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

  async function onSubmit(data: z.output<typeof createPropuestaSchema>) {
    const detalleServicios = detalles
      .filter((d) => d.concepto && d.monto)
      .map((d) => ({ concepto: d.concepto, monto: parseFloat(d.monto) }))

    try {
      const res = await fetch("/api/propuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          detalleServicios: detalleServicios.length > 0 ? detalleServicios : null,
          recotizarId: recotizarId || undefined,
        }),
      })

      if (res.ok) {
        router.push("/propuestas")
        router.refresh()
      } else {
        const json = await res.json()
        setError("root", { message: json.error || "Error al crear la propuesta" })
      }
    } catch {
      setError("root", { message: "Error de conexión" })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root?.message && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {errors.root.message}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Proyecto *</label>
        <select {...register("proyectoId")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Seleccionar proyecto</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} — {p.cliente.razonSocial} ({p.estado})
            </option>
          ))}
        </select>
        {errors.proyectoId && <p className="text-xs text-destructive">{errors.proyectoId.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Monto total (ARS) *</label>
        <input {...register("montoTotal", { valueAsNumber: true })} type="number" step="0.01" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="0.00" />
        {errors.montoTotal && <p className="text-xs text-destructive">{errors.montoTotal.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha de emisión</label>
          <input {...register("fechaEmision")} type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          {errors.fechaEmision && <p className="text-xs text-destructive">{errors.fechaEmision.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Fecha de vencimiento *</label>
          <input {...register("fechaVencimiento")} type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          {errors.fechaVencimiento && <p className="text-xs text-destructive">{errors.fechaVencimiento.message}</p>}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">Detalle de servicios</label>
          <button type="button" onClick={addDetalle} className="text-xs text-primary hover:underline">
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
              <button type="button" onClick={() => removeDetalle(i)} className="px-2 text-sm text-red-400 hover:underline">
                X
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
        >
          {isSubmitting ? "Guardando..." : recotizarId ? "Crear recotización" : "Crear propuesta"}
        </button>
        <Link href="/propuestas" className="inline-flex h-10 items-center justify-center rounded-md border border-input px-6 text-sm font-medium hover:bg-muted">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
