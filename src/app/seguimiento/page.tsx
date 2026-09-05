"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SeguimientoPage() {
  const router = useRouter()
  const [proyectoId, setProyectoId] = useState("")
  const [clave, setClave] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/portal/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proyectoId: proyectoId.trim(), clave }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al acceder")
        setLoading(false)
        return
      }

      router.push(`/seguimiento/${data.proyectoId}`)
    } catch {
      setError("Error de conexión")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0090ff] flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">LoBeMo</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Seguimiento de Proyecto</h1>
          <p className="text-[#94a3b8] text-sm">Ingresá los datos de tu proyecto para ver su estado</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="proyectoId" className="text-sm font-medium text-[#e2e8f0]">
              ID del Proyecto
            </label>
            <input
              id="proyectoId"
              type="text"
              value={proyectoId}
              onChange={(e) => setProyectoId(e.target.value)}
              placeholder="Ej: clxxx... (cuid)"
              required
              className="h-11 w-full rounded-lg border border-[#1e293b] bg-[#0f172a] px-4 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff] transition-all font-mono"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="clave" className="text-sm font-medium text-[#e2e8f0]">
              Contraseña
            </label>
            <input
              id="clave"
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Ingresá tu contraseña"
              required
              className="h-11 w-full rounded-lg border border-[#1e293b] bg-[#0f172a] px-4 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0090ff] text-[#0a0a1a] text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? "Ingresando..." : "Ingresar al portal"}
          </button>
        </form>

        <p className="text-center text-[#475569] text-xs mt-6">
          Estos datos te fueron enviados por email al crear tu proyecto.
        </p>
      </div>
    </div>
  )
}
