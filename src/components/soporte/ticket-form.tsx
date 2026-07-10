"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { createTicketSchema } from "@/shared/validation"

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
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      prioridad: "MEDIA" as const,
      categoria: "CONSULTA" as const,
      clienteNombre: "",
      proyectoId: "",
      asignadoAId: "",
    },
  })

  async function onSubmit(data: z.output<typeof createTicketSchema>) {
    try {
      const res = await fetch("/api/soporte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          proyectoId: data.proyectoId || null,
          asignadoAId: data.asignadoAId || null,
        }),
      })

      if (res.ok) {
        const ticket = await res.json()
        router.push(`/soporte/${ticket.id}`)
      } else {
        const json = await res.json()
        setError("root", { message: json.error || "Error al crear el ticket" })
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
        <input {...register("titulo")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Ej: Problema con el firewall del cliente" />
        {errors.titulo && <p className="text-xs text-destructive">{errors.titulo.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Descripción</label>
        <textarea {...register("descripcion")} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]" placeholder="Describa el incidente o solicitud..." />
        {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Prioridad</label>
          <select {...register("prioridad")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Crítica</option>
          </select>
          {errors.prioridad && <p className="text-xs text-destructive">{errors.prioridad.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Categoría</label>
          <select {...register("categoria")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="CONSULTA">Consulta</option>
            <option value="INCIDENTE">Incidente</option>
            <option value="SOLICITUD">Solicitud</option>
          </select>
          {errors.categoria && <p className="text-xs text-destructive">{errors.categoria.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Nombre del cliente (sin registro)</label>
        <input {...register("clienteNombre")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Ej: Empresa ABC SRL" />
        {errors.clienteNombre && <p className="text-xs text-destructive">{errors.clienteNombre.message}</p>}
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
        <label className="text-sm font-medium">Asignar a técnico</label>
        <select {...register("asignadoAId")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Sin asignar</option>
          {empleados.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>
          ))}
        </select>
        {errors.asignadoAId && <p className="text-xs text-destructive">{errors.asignadoAId.message}</p>}
      </div>

      <div className="flex gap-4">
        <button type="submit" disabled={isSubmitting} className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50">
          {isSubmitting ? "Creando..." : "Crear ticket"}
        </button>
        <Link href="/soporte" className="inline-flex h-10 items-center justify-center rounded-md border border-input px-6 text-sm font-medium hover:bg-muted">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
