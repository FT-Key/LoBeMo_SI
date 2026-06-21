"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const SECTORES = [
  "SALUD", "CONTABLE_JURIDICO", "COMERCIAL", "LOGISTICA",
  "AGROINDUSTRIA", "GOBIERNO", "OTRO",
] as const

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
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [requireCuitConfirm, setRequireCuitConfirm] = useState(false)
  const [cuitOriginal] = useState(cliente.cuit)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setRequireCuitConfirm(false)

    const formData = new FormData(e.currentTarget)
    const data: Record<string, unknown> = {
      razonSocial: formData.get("razonSocial"),
      emailContacto: formData.get("emailContacto") || null,
      telefono: formData.get("telefono") || null,
      direccion: formData.get("direccion") || null,
      sector: formData.get("sector") || null,
    }

    const cuit = formData.get("cuit") as string
    if (cuit !== cuitOriginal) {
      data.cuit = cuit
      data.confirmCuit = true
    }

    const res = await fetch(`/api/clientes/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const json = await res.json()
      if (json.requiereConfirmacion) {
        setRequireCuitConfirm(true)
        setError("Cambiar el CUIT requiere confirmación. Marca la casilla.")
      } else {
        setError(json.error || "Error al actualizar cliente")
      }
      setLoading(false)
      return
    }

    router.push("/clientes")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-2">
        <label htmlFor="razonSocial" className="text-sm font-medium">Razón Social *</label>
        <input id="razonSocial" name="razonSocial" type="text" required defaultValue={cliente.razonSocial} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="cuit" className="text-sm font-medium">CUIT</label>
        <input id="cuit" name="cuit" type="text" defaultValue={cliente.cuit} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {requireCuitConfirm && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="confirmCuit" defaultChecked />
            Confirmo el cambio de CUIT
          </label>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="emailContacto" className="text-sm font-medium">Email de contacto</label>
        <input id="emailContacto" name="emailContacto" type="email" defaultValue={cliente.emailContacto ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="telefono" className="text-sm font-medium">Teléfono</label>
        <input id="telefono" name="telefono" type="text" defaultValue={cliente.telefono ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="direccion" className="text-sm font-medium">Dirección</label>
        <input id="direccion" name="direccion" type="text" defaultValue={cliente.direccion ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="sector" className="text-sm font-medium">Sector</label>
        <select id="sector" name="sector" defaultValue={cliente.sector ?? ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Seleccionar...</option>
          {SECTORES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading} className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50">
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  )
}
