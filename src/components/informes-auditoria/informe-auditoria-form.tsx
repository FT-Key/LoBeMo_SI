"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { createInformeSchema, type CreateInformeFormData } from "@/shared/validation"

type Proyecto = { id: string; nombre: string }

export function InformeAuditoriaForm({ proyectos }: { proyectos: Proyecto[] }) {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<CreateInformeFormData>({
    resolver: zodResolver(createInformeSchema),
    defaultValues: { proyectoId: "", alcance: "", criteriosAuditoria: "" },
  })

  async function onSubmit(data: CreateInformeFormData) {
    try {
      const res = await fetch("/api/informes-auditoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        setError("root", { message: err.error || "Error al crear el informe" })
        return
      }

      const informe = await res.json()
      router.push(`/informes-auditoria/${informe.id}`)
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
        <label className="text-sm font-medium">Proyecto *</label>
        <select {...register("proyectoId")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Seleccionar proyecto...</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">Solo proyectos de tipo Auditoría ISO 27001</p>
        {errors.proyectoId && <p className="text-xs text-destructive">{errors.proyectoId.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Alcance de la auditoría *</label>
        <textarea {...register("alcance")} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]" placeholder="Describa el alcance de la auditoría..." />
        {errors.alcance && <p className="text-xs text-destructive">{errors.alcance.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Criterios de auditoría *</label>
        <textarea {...register("criteriosAuditoria")} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]" placeholder="Describa los criterios utilizados para la auditoría..." />
        {errors.criteriosAuditoria && <p className="text-xs text-destructive">{errors.criteriosAuditoria.message}</p>}
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={isSubmitting} className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50">
          {isSubmitting ? "Creando..." : "Crear informe"}
        </button>
        <button type="button" onClick={() => router.back()} className="inline-flex h-10 items-center justify-center rounded-md border border-input px-6 text-sm font-medium hover:bg-muted">
          Cancelar
        </button>
      </div>
    </form>
  )
}
