"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createServicioSchema, type CreateServicioFormData } from "@/shared/validation"

export function NuevoServicioForm({ onSuccess }: { onSuccess?: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<CreateServicioFormData>({
    resolver: zodResolver(createServicioSchema),
    defaultValues: { nombre: "", descripcion: "", precioBase: undefined },
  })

  async function onSubmit(data: CreateServicioFormData) {
    const payload = {
      ...data,
      precioBase: data.precioBase ? Number(data.precioBase) : null,
    }
    const res = await fetch("/api/servicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const json = await res.json()
      setError("root", { message: json.error || "Error al crear servicio" })
      return
    }

    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-md bg-yellow-500/10 border border-yellow-500/30 p-3 text-sm text-yellow-700 dark:text-yellow-400">
        <strong>Precaución:</strong> El nombre del servicio es único y no podrá modificarse después de la creación.
      </div>

      {errors.root?.message && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{errors.root.message}</div>
      )}

      <div className="space-y-2">
        <label htmlFor="nombre" className="text-sm font-medium">Nombre del servicio *</label>
        <input id="nombre" {...register("nombre")} type="text" placeholder="Ej: Auditoría ISO 27001" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="descripcion" className="text-sm font-medium">Descripción</label>
        <textarea id="descripcion" {...register("descripcion")} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Descripción del servicio..." />
        {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="precioBase" className="text-sm font-medium">Precio base (ARS)</label>
        <input id="precioBase" {...register("precioBase")} type="number" step="0.01" min="0" placeholder="0.00" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.precioBase && <p className="text-xs text-destructive">{errors.precioBase.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50">
        {isSubmitting ? "Creando..." : "Crear servicio"}
      </button>
    </form>
  )
}
