"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const ESTADO_BADGES: Record<string, string> = {
  ENVIADA: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  ACEPTADA: "bg-green-500/15 text-green-400 border border-green-500/25",
  RECHAZADA: "bg-red-500/15 text-red-400 border border-red-500/25",
  RECOTIZADA: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
}

type PropuestaDetalleProps = {
  propuesta: Record<string, unknown>
  sessionRol: string
  estadoLabels: Record<string, string>
}

export function PropuestaDetalle({ propuesta, sessionRol, estadoLabels }: PropuestaDetalleProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const p = propuesta as {
    id: string
    version: number
    montoTotal: string
    detalleServicios: Array<{ concepto: string; monto: number }> | null
    fechaEmision: string
    fechaVencimiento: string
    estado: string
    createdAt: string
    proyecto: {
      id: string
      nombre: string
      estado: string
      cliente: { id: string; razonSocial: string; cuit: string }
      servicio: { id: string; nombre: string }
    }
  }

  const puedeAceptar = ["GERENTE_GENERAL", "CISO"].includes(sessionRol)
  const puedeRecotizar = ["GERENTE_GENERAL", "ADMINISTRACION", "VENTAS"].includes(sessionRol)
  const vencida = p.estado === "ENVIADA" && new Date(p.fechaVencimiento) < new Date()

  async function handleCambioEstado(nuevoEstado: string) {
    setError("")
    setSuccess("")
    setUpdating(true)

    try {
      const res = await fetch(`/api/propuestas/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      })

      const json = await res.json()
      if (res.ok) {
        setSuccess(`Propuesta marcada como "${estadoLabels[nuevoEstado] ?? nuevoEstado}"`)
        router.refresh()
      } else {
        setError(json.error || "Error al actualizar la propuesta")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-500/15 border border-red-500/25 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-500/15 border border-green-500/25 p-3 text-sm text-green-400">
          {success}
        </div>
      )}

      <div className="rounded-lg border bg-surface-elevated/80 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              Propuesta v{p.version} — {p.proyecto.nombre}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Cliente: {p.proyecto.cliente.razonSocial} — Servicio: {p.proyecto.servicio.nombre.replace(/_/g, " ")}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${ESTADO_BADGES[p.estado] ?? ""}`}>
            {estadoLabels[p.estado] ?? p.estado}
          </span>
        </div>

        {vencida && (
          <div className="rounded-md bg-red-500/15 border border-red-500/25 p-3 text-sm text-red-400 mb-4">
            Esta propuesta está vencida.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Versión</span>
            <p className="font-medium">{p.version}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Monto total</span>
            <p className="font-medium">ARS {Number(p.montoTotal).toLocaleString("es-AR", { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Emisión</span>
            <p className="font-medium">{new Date(p.fechaEmision).toLocaleDateString("es-AR")}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Vencimiento</span>
            <p className="font-medium">{new Date(p.fechaVencimiento).toLocaleDateString("es-AR")}</p>
          </div>
        </div>
      </div>

      {p.detalleServicios && p.detalleServicios.length > 0 && (
        <div className="rounded-lg border bg-surface-elevated/80 p-6">
          <h3 className="text-lg font-semibold mb-3">Detalle de servicios</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Concepto</th>
                <th className="text-right p-2 font-medium">Monto</th>
              </tr>
            </thead>
            <tbody>
              {p.detalleServicios.map((d, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-2">{d.concepto}</td>
                  <td className="p-2 text-right">ARS {d.monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-lg border bg-surface-elevated/80 p-6">
        <h3 className="text-lg font-semibold mb-2">Proyecto relacionado</h3>
        <p className="text-sm mb-2">
          <Link href={`/proyectos/${p.proyecto.id}`} className="text-primary hover:underline">
            {p.proyecto.nombre}
          </Link>
          <span className="text-muted-foreground ml-2">({p.proyecto.estado})</span>
        </p>
      </div>

      {p.estado === "ENVIADA" && (
        <div className="rounded-lg border bg-surface-elevated/80 p-6">
          <h3 className="text-lg font-semibold mb-3">Acciones</h3>
          <div className="flex flex-wrap gap-2">
            {puedeAceptar && (
              <button
                onClick={() => handleCambioEstado("ACEPTADA")}
                disabled={updating}
                className="inline-flex h-10 items-center justify-center rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {updating ? "Procesando..." : "Aceptar propuesta"}
              </button>
            )}
            <button
              onClick={() => handleCambioEstado("RECHAZADA")}
              disabled={updating}
              className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {updating ? "Procesando..." : "Rechazar propuesta"}
            </button>
          </div>
        </div>
      )}

      {(p.estado === "RECHAZADA" || p.estado === "RECOTIZADA") && puedeRecotizar && (
        <div className="rounded-lg border bg-surface-elevated/80 p-6">
          <h3 className="text-lg font-semibold mb-3">Recotizar</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Crea una nueva versión de esta propuesta con condiciones actualizadas.
          </p>
          <Link
            href={`/propuestas/nuevo?proyectoId=${p.proyecto.id}&recotizar=${p.id}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Crear recotización
          </Link>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Creada: {new Date(p.createdAt).toLocaleString("es-AR")}
      </div>
    </div>
  )
}
