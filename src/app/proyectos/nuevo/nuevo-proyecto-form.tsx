"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { createProyectoSchema, type CreateProyectoFormData } from "@/shared/validation"

export function NuevoProyectoForm({
  clientes,
  servicios,
}: {
  clientes: { id: string; razonSocial: string }[]
  servicios: { id: string; nombre: string }[]
}) {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<CreateProyectoFormData>({
    resolver: zodResolver(createProyectoSchema),
    defaultValues: { nombre: "", descripcion: "", clienteId: "", servicioId: "", fechaEstimadaFin: "", montoAcordado: "" },
  })

  async function onSubmit(data: CreateProyectoFormData) {
    try {
      const res = await fetch("/api/proyectos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.push("/proyectos")
        router.refresh()
      } else {
        const json = await res.json()
        setError("root", { message: json.error || "Error al crear el proyecto" })
      }
    } catch {
      setError("root", { message: "Error de conexión" })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {errors.root?.message && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {errors.root.message}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Nombre del proyecto *</label>
        <input {...register("nombre")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Ej: Auditoría ISO 27001 - Cliente X" />
        {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descripción</label>
        <textarea {...register("descripcion")} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Descripción del proyecto..." />
        {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Cliente *</label>
        <select {...register("clienteId")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Seleccionar cliente</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.razonSocial}</option>
          ))}
        </select>
        {errors.clienteId && <p className="text-xs text-destructive">{errors.clienteId.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Servicio *</label>
        <select {...register("servicioId")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Seleccionar servicio</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre.replace(/_/g, " ")}</option>
          ))}
        </select>
        {errors.servicioId && <p className="text-xs text-destructive">{errors.servicioId.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Fecha estimada de finalización</label>
        <input {...register("fechaEstimadaFin")} type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.fechaEstimadaFin && <p className="text-xs text-destructive">{errors.fechaEstimadaFin.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Monto acordado (ARS)</label>
        <input {...register("montoAcordado")} type="number" step="0.01" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="0.00" />
        {errors.montoAcordado && <p className="text-xs text-destructive">{errors.montoAcordado.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50">
        {isSubmitting ? "Guardando..." : "Crear proyecto"}
      </button>
    </form>
  )
}
