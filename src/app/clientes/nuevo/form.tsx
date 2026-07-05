"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const SECTORES = [
  "SALUD", "CONTABLE_JURIDICO", "COMERCIAL", "LOGISTICA",
  "AGROINDUSTRIA", "GOBIERNO", "OTRO",
] as const

export function NuevoClienteForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      razonSocial: formData.get("razonSocial") as string,
      cuit: formData.get("cuit") as string,
      emailContacto: formData.get("emailContacto") as string,
      telefono: formData.get("telefono") as string,
      direccion: formData.get("direccion") as string,
      sector: formData.get("sector") as string,
    }

    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const json = await res.json()
      setError(json.error || "Error al crear cliente")
      setLoading(false)
      return
    }

    router.push("/clientes")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="space-y-2">
        <label htmlFor="razonSocial" className="text-sm font-medium">Razón Social *</label>
        <input id="razonSocial" name="razonSocial" type="text" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="cuit" className="text-sm font-medium">CUIT *</label>
        <input id="cuit" name="cuit" type="text" required placeholder="XX-XXXXXXXX-X" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="emailContacto" className="text-sm font-medium">Email de contacto</label>
        <input id="emailContacto" name="emailContacto" type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="telefono" className="text-sm font-medium">Teléfono</label>
        <input id="telefono" name="telefono" type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="direccion" className="text-sm font-medium">Dirección</label>
        <input id="direccion" name="direccion" type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="sector" className="text-sm font-medium">Sector</label>
        <select id="sector" name="sector" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Seleccionar...</option>
          {SECTORES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading} className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50">
        {loading ? "Creando..." : "Crear cliente"}
      </button>
    </form>
  )
}
