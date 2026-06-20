"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const nombre = formData.get("nombre") as string
    const apellido = formData.get("apellido") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const res = await fetch("/api/empleados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        apellido,
        email,
        password,
        rol: "GERENTE_GENERAL",
        area: "GERENCIA",
        isInitialSetup: true,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Error al crear el superadmin")
      setLoading(false)
      return
    }

    router.push("/login")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <button type="submit" disabled={loading} className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50">
        {loading ? "Creando..." : "Registrar superadmin"}
      </button>
    </form>
  )
}
