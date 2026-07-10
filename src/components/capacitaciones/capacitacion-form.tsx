"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { createCapacitacionSchema } from "@/shared/validation"

type Proyecto = { id: string; nombre: string }

export function CapacitacionForm({ proyectos }: { proyectos: Proyecto[] }) {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(createCapacitacionSchema),
    defaultValues: {
      proyectoId: "",
      titulo: "",
      temario: "",
      duracionHoras: "" as unknown as number,
      modalidad: "PRESENCIAL" as const,
      fechaInicio: "",
      fechaFin: "",
      materiales: "",
    },
  })

  async function onSubmit(data: z.output<typeof createCapacitacionSchema>) {
    try {
      const res = await fetch("/api/capacitaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          proyectoId: data.proyectoId || null,
          fechaFin: data.fechaFin || null,
          materiales: data.materiales?.trim() || null,
        }),
      })

      if (res.ok) {
        const capacitacion = await res.json()
        router.push(`/capacitaciones/${capacitacion.id}`)
      } else {
        const json = await res.json()
        setError("root", { message: json.error || "Error al crear la capacitación" })
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
        <label className="text-sm font-medium">Título *</label>
        <input {...register("titulo")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Ej: Capacitación en OWASP Top 10" />
        {errors.titulo && <p className="text-xs text-destructive">{errors.titulo.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Temario *</label>
        <textarea {...register("temario")} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[120px]" placeholder="Describa el contenido de la capacitación..." />
        {errors.temario && <p className="text-xs text-destructive">{errors.temario.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Duración (horas) *</label>
          <input {...register("duracionHoras", { valueAsNumber: true })} type="number" min="1" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="8" />
          {errors.duracionHoras && <p className="text-xs text-destructive">{errors.duracionHoras.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Modalidad *</label>
          <select {...register("modalidad")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="PRESENCIAL">Presencial</option>
            <option value="REMOTA">Remota</option>
          </select>
          {errors.modalidad && <p className="text-xs text-destructive">{errors.modalidad.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha de inicio *</label>
          <input {...register("fechaInicio")} type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          {errors.fechaInicio && <p className="text-xs text-destructive">{errors.fechaInicio.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Fecha de finalización</label>
          <input {...register("fechaFin")} type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          {errors.fechaFin && <p className="text-xs text-destructive">{errors.fechaFin.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Proyecto asociado</label>
        <select {...register("proyectoId")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Sin proyecto asociado</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        {errors.proyectoId && <p className="text-xs text-destructive">{errors.proyectoId.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Materiales (URLs o referencias)</label>
        <textarea {...register("materiales")} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Enlaces a materiales, documentos, presentaciones..." />
        {errors.materiales && <p className="text-xs text-destructive">{errors.materiales.message}</p>}
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={isSubmitting} className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50">
          {isSubmitting ? "Creando..." : "Crear capacitación"}
        </button>
        <Link href="/capacitaciones" className="inline-flex h-10 items-center justify-center rounded-md border border-input px-6 text-sm font-medium hover:bg-muted">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
