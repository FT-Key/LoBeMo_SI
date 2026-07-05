"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const ROLES = [
  "GERENTE_GENERAL", "ADMINISTRACION", "VENTAS", "CISO",
  "ANALISTA_SEGURIDAD", "DESARROLLADOR", "ESPECIALISTA_REDES",
  "PENTESTER", "SOPORTE_TECNICO", "AUDITOR", "CAPACITADOR",
] as const

const AREAS = [
  "GERENCIA", "ADMINISTRACION", "COMERCIAL", "SISTEMAS", "AUDITORIA", "CAPACITACION",
] as const

export function NuevoEmpleadoForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      nombre: formData.get("nombre") as string,
      apellido: formData.get("apellido") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      rol: formData.get("rol") as string,
      area: formData.get("area") as string,
    }

    const res = await fetch("/api/empleados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const json = await res.json()
      setError(json.error || "Error al crear empleado")
      setLoading(false)
      return
    }

    router.push("/empleados")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="nombre" className="text-sm font-medium">Nombre</label>
        <input id="nombre" name="nombre" type="text" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="apellido" className="text-sm font-medium">Apellido</label>
        <input id="apellido" name="apellido" type="text" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
        <input id="password" name="password" type="password" required minLength={6} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div className="space-y-2">
        <label htmlFor="rol" className="text-sm font-medium">Rol</label>
        <select id="rol" name="rol" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Seleccionar...</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="area" className="text-sm font-medium">Área</label>
        <select id="area" name="area" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Seleccionar...</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={loading} className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50">
        {loading ? "Creando..." : "Crear empleado"}
      </button>
    </form>
  )
}
