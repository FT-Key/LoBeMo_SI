"use client"

import { useState } from "react"

type PortalSectionProps = {
  proyectoId: string
  portalActivo: boolean
  portalClaveExiste: boolean
  clienteEmail: string | null
}

export function PortalSection({ proyectoId, portalActivo, portalClaveExiste, clienteEmail }: PortalSectionProps) {
  const [activo, setActivo] = useState(portalActivo)
  const [clave, setClave] = useState("")
  const [showClave, setShowClave] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSave() {
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const body: Record<string, unknown> = { portalActivo: activo }
      if (clave) body.portalClave = clave

      const res = await fetch(`/api/proyectos/${proyectoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error al guardar")
        setLoading(false)
        return
      }

      setSuccess("Configuración del portal guardada")
      setClave("")
      setLoading(false)
    } catch {
      setError("Error de conexión")
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border bg-surface-elevated/80 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-lg bg-[#00d4ff]/15 flex items-center justify-center">
          <svg className="h-4 w-4 text-[#00d4ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Portal del Cliente</h3>
          <p className="text-xs text-muted-foreground">Seguimiento de proyecto para el cliente</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive mb-4">{error}</div>
      )}
      {success && (
        <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-400 mb-4">{success}</div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Portal activo</p>
            <p className="text-xs text-muted-foreground">El cliente puede acceder con ID + contraseña</p>
          </div>
          <button
            onClick={() => setActivo(!activo)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${activo ? "bg-[#00d4ff]" : "bg-muted"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${activo ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        <div className="space-y-2">
          <label htmlFor="portalClave" className="text-sm font-medium">
            Contraseña de acceso {portalClaveExiste && <span className="text-muted-foreground">(ya configurada)</span>}
          </label>
          <div className="flex gap-2">
            <input
              id="portalClave"
              type={showClave ? "text" : "password"}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder={portalClaveExiste ? "Dejar vacío para mantener la actual" : "Ingresar contraseña (mín. 6 caracteres)"}
              className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowClave(!showClave)}
              className="h-10 px-3 rounded-md border border-input hover:bg-muted text-sm"
            >
              {showClave ? "Ocultar" : "Ver"}
            </button>
          </div>
        </div>

        {clienteEmail && (
          <p className="text-xs text-muted-foreground">
            Email del cliente: <span className="text-foreground">{clienteEmail}</span>
            {activo && " · Se enviará un email con las credenciales al guardar"}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="h-10 rounded-md bg-[#00d4ff] px-4 text-sm font-semibold text-[#0a0a1a] hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </div>
  )
}
