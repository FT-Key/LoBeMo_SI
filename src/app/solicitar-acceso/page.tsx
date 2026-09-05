"use client"

import { useState } from "react"
import Link from "next/link"

type ProyectoAcceso = {
  codigo: string
  nombre: string
  estado: string
  claveTemporal: string
}

type ResultadoBusqueda = {
  ok: true
  cliente: string
  proyectos: ProyectoAcceso[]
}

export default function SolicitarAccesoPage() {
  const [email, setEmail] = useState("")
  const [resultado, setResultado] = useState<ResultadoBusqueda | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setResultado(null)
    setLoading(true)

    try {
      const res = await fetch("/api/proyectos-acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "No se encontraron proyectos")
        setLoading(false)
        return
      }

      setResultado(data)
    } catch {
      setError("Error de conexión")
    }
    setLoading(false)
  }

  const ESTADOS_LABELS: Record<string, string> = {
    RELEVAMIENTO: "Relevamiento",
    PROPUESTA: "Propuesta",
    APROBADO: "Aprobado",
    EN_EJECUCION: "En Ejecución",
    EN_REVISION: "En Revisión",
    ENTREGADO: "Entregado",
    CERRADO: "Cerrado",
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <a href="/" className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0090ff] flex items-center justify-center hover:opacity-80 transition-opacity">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </a>
            <span className="text-xl font-bold text-white">LoBeMo</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Solicitar Acceso</h1>
          <p className="text-[#94a3b8] text-sm">Ingresá tu email para recuperar las credenciales de tus proyectos</p>
        </div>

        {!resultado ? (
          <form onSubmit={handleSubmit} className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#e2e8f0]">
                Email del contacto
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="h-11 w-full rounded-lg border border-[#1e293b] bg-[#0f172a] px-4 text-sm text-white placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50 focus:border-[#00d4ff] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0090ff] text-[#0a0a1a] text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? "Buscando..." : "Buscar mis proyectos"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-lg p-4">
              <p className="text-emerald-400 text-sm font-medium">
                Se encontraron {resultado.proyectos.length} proyecto{resultado.proyectos.length !== 1 ? "s" : ""} para <strong>{resultado.cliente}</strong>
              </p>
              <p className="text-emerald-400/70 text-xs mt-1">
                Se enviaron las credenciales a <strong>{email}</strong>
              </p>
            </div>

            {resultado.proyectos.map((p) => (
              <div
                key={p.codigo}
                className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{p.nombre}</h3>
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium mt-1 border-[#1e293b] text-[#94a3b8]">
                      {ESTADOS_LABELS[p.estado] || p.estado}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0f172a] rounded-lg p-3">
                    <p className="text-[#475569] text-[10px] uppercase tracking-wider mb-1">Código</p>
                    <p className="text-[#00d4ff] text-sm font-mono font-semibold">{p.codigo}</p>
                  </div>
                  <div className="bg-[#0f172a] rounded-lg p-3">
                    <p className="text-[#475569] text-[10px] uppercase tracking-wider mb-1">Contraseña</p>
                    <p className="text-white text-sm font-mono font-semibold">{p.claveTemporal}</p>
                  </div>
                </div>

                <Link
                  href={`/seguimiento/${p.codigo}`}
                  className="block w-full h-9 rounded-lg bg-[#1e293b] text-[#e2e8f0] text-xs font-medium text-center leading-9 hover:bg-[#2d3a4d] transition-colors"
                >
                  Ingresar al portal
                </Link>
              </div>
            ))}

            <button
              onClick={() => { setResultado(null); setEmail(""); setError("") }}
              className="w-full h-10 rounded-lg border border-[#1e293b] text-[#94a3b8] text-xs font-medium hover:bg-[#111827] transition-colors"
            >
              Buscar con otro email
            </button>
          </div>
        )}

        <p className="text-center text-[#475569] text-xs mt-6">
          <Link href="/seguimiento" className="text-[#00d4ff] hover:underline">Volver al login del portal</Link>
        </p>
      </div>
    </div>
  )
}
