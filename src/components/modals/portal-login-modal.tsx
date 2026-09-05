"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type PortalLoginModalProps = {
  open: boolean
  onClose: () => void
}

export function PortalLoginModal({ open, onClose }: PortalLoginModalProps) {
  const router = useRouter()
  const [codigo, setCodigo] = useState("")
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
        body: JSON.stringify({ codigo: codigo.trim(), clave }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al acceder")
        setLoading(false)
        return
      }

      setCodigo("")
      setClave("")
      onClose()
      router.push(`/seguimiento/${data.codigo}`)
    } catch {
      setError("Error de conexión")
      setLoading(false)
    }
  }

  function handleClose() {
    if (!loading) {
      setCodigo("")
      setClave("")
      setError("")
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[#1e293b] bg-[#111827] p-6 shadow-2xl">
        <button
          onClick={handleClose}
          disabled={loading}
          className="absolute right-4 top-4 text-[#475569] hover:text-white disabled:opacity-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0090ff] flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-bold text-white">Seguimiento de Proyecto</h2>
          <p className="text-[#94a3b8] text-xs mt-1">Ingresá los datos de tu proyecto</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="modal-codigo" className="text-sm font-medium text-[#e2e8f0]">Código del Proyecto</label>
            <input
              id="modal-codigo"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej: LBM-CENT-A3K9"
              required
              disabled={loading}
              className="h-10 w-full rounded-lg border border-[#1e293b] bg-[#0f172a] px-3 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff] transition-all font-mono disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="modal-clave" className="text-sm font-medium text-[#e2e8f0]">Contraseña</label>
            <input
              id="modal-clave"
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Contraseña del portal"
              required
              disabled={loading}
              className="h-10 w-full rounded-lg border border-[#1e293b] bg-[#0f172a] px-3 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff] transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0090ff] text-[#0a0a1a] text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? "Ingresando..." : "Ingresar al portal"}
          </button>
        </form>

        <p className="text-center text-[#475569] text-[11px] mt-4">
          ¿Olvidaste tus credenciales?{" "}
          <a href="/solicitar-acceso" className="text-[#00d4ff] hover:underline">Recuperá tu acceso</a>
        </p>
      </div>
    </div>
  )
}
