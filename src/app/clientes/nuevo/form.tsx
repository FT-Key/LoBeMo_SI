"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { createClienteSchema, SECTORES, type CreateClienteFormData } from "@/shared/validation"

export function NuevoClienteForm() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<CreateClienteFormData>({
    resolver: zodResolver(createClienteSchema),
    defaultValues: { razonSocial: "", cuit: "", emailContacto: "", telefono: "", direccion: "", sector: "" },
  })

  async function onSubmit(data: CreateClienteFormData) {
    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const json = await res.json()
      setError("root", { message: json.error || "Error al crear cliente" })
      return
    }

    router.push("/clientes")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {errors.root?.message && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{errors.root.message}</div>
      )}

      <div className="space-y-2">
        <label htmlFor="razonSocial" className="text-sm font-medium">Razón Social *</label>
        <input id="razonSocial" {...register("razonSocial")} type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.razonSocial && <p className="text-xs text-destructive">{errors.razonSocial.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="cuit" className="text-sm font-medium">CUIT *</label>
        <input id="cuit" {...register("cuit")} type="text" placeholder="XX-XXXXXXXX-X" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.cuit && <p className="text-xs text-destructive">{errors.cuit.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="emailContacto" className="text-sm font-medium">Email de contacto</label>
        <input id="emailContacto" {...register("emailContacto")} type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.emailContacto && <p className="text-xs text-destructive">{errors.emailContacto.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="telefono" className="text-sm font-medium">Teléfono</label>
        <input id="telefono" {...register("telefono")} type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.telefono && <p className="text-xs text-destructive">{errors.telefono.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="direccion" className="text-sm font-medium">Dirección</label>
        <input id="direccion" {...register("direccion")} type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.direccion && <p className="text-xs text-destructive">{errors.direccion.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="sector" className="text-sm font-medium">Sector</label>
        <select id="sector" {...register("sector")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Seleccionar...</option>
          {SECTORES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        {errors.sector && <p className="text-xs text-destructive">{errors.sector.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50">
        {isSubmitting ? "Creando..." : "Crear cliente"}
      </button>
    </form>
  )
}
