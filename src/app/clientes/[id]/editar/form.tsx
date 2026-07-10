"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { updateClienteSchema, SECTORES, type UpdateClienteFormData } from "@/shared/validation"

type ClienteData = {
  id: string
  razonSocial: string
  cuit: string
  emailContacto: string | null
  telefono: string | null
  direccion: string | null
  sector: string | null
}

export function EditarClienteForm({ cliente }: { cliente: ClienteData }) {
  const router = useRouter()
  const [requireCuitConfirm, setRequireCuitConfirm] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<UpdateClienteFormData>({
    resolver: zodResolver(updateClienteSchema),
    defaultValues: {
      razonSocial: cliente.razonSocial,
      cuit: cliente.cuit,
      emailContacto: cliente.emailContacto ?? "",
      telefono: cliente.telefono ?? "",
      direccion: cliente.direccion ?? "",
      sector: (cliente.sector ?? "") as UpdateClienteFormData["sector"],
    },
  })

  async function onSubmit(data: UpdateClienteFormData) {
    setRequireCuitConfirm(false)

    const payload: Record<string, unknown> = { ...data }
    if (data.cuit !== cliente.cuit) {
      payload.confirmCuit = true
    }

    const res = await fetch(`/api/clientes/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const json = await res.json()
      if (json.requiereConfirmacion) {
        setRequireCuitConfirm(true)
        setError("root", { message: "Cambiar el CUIT requiere confirmación. Marca la casilla." })
      } else {
        setError("root", { message: json.error || "Error al actualizar cliente" })
      }
      return
    }

    router.push("/clientes")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root?.message && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{errors.root.message}</div>
      )}

      <div className="space-y-2">
        <label htmlFor="razonSocial" className="text-sm font-medium">Razón Social *</label>
        <input id="razonSocial" {...register("razonSocial")} type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.razonSocial && <p className="text-xs text-destructive">{errors.razonSocial.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="cuit" className="text-sm font-medium">CUIT</label>
        <input id="cuit" {...register("cuit")} type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.cuit && <p className="text-xs text-destructive">{errors.cuit.message}</p>}
        {requireCuitConfirm && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="confirmCuit" defaultChecked />
            Confirmo el cambio de CUIT
          </label>
        )}
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
        {isSubmitting ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  )
}
