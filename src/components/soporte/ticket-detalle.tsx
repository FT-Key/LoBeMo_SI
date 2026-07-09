"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const ESTADO_BADGES: Record<string, string> = {
  ABIERTO: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  EN_PROCESO: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
  RESUELTO: "bg-green-500/15 text-green-400 border border-green-500/25",
  CERRADO: "bg-gray-500/15 text-gray-400 border border-gray-500/25",
}

const ESTADO_LABELS: Record<string, string> = {
  ABIERTO: "Abierto",
  EN_PROCESO: "En proceso",
  RESUELTO: "Resuelto",
  CERRADO: "Cerrado",
}

const PRIORIDAD_BADGES: Record<string, string> = {
  BAJA: "bg-green-500/15 text-green-400 border border-green-500/25",
  MEDIA: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  ALTA: "bg-orange-500/15 text-orange-400 border border-orange-500/25",
  CRITICA: "bg-red-500/15 text-red-400 border border-red-500/25",
}

type Ticket = {
  id: string
  titulo: string
  descripcion: string | null
  prioridad: string
  estado: string
  categoria: string | null
  clienteNombre: string | null
  proyecto: { id: string; nombre: string; estado: string } | null
  creador: { id: string; nombre: string; apellido: string; email: string }
  asignadoA: { id: string; nombre: string; apellido: string; email: string } | null
  createdAt: string
}

export function TicketDetalle({
  ticket: initialData,
  sessionRol,
}: {
  ticket: Ticket
  sessionRol: string
}) {
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket>(initialData)
  const [editando, setEditando] = useState(false)
  const [editGeneral, setEditGeneral] = useState({
    titulo: initialData.titulo,
    descripcion: initialData.descripcion ?? "",
    prioridad: initialData.prioridad,
    categoria: initialData.categoria ?? "",
    clienteNombre: initialData.clienteNombre ?? "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const puedeEditar = ["SOPORTE_TECNICO", "GERENTE_GENERAL", "CISO"].includes(sessionRol)

  const TRANSICIONES: Record<string, string[]> = {
    ABIERTO: ["EN_PROCESO"],
    EN_PROCESO: ["RESUELTO", "ABIERTO"],
    RESUELTO: ["CERRADO", "EN_PROCESO"],
    CERRADO: [],
  }

  async function guardarCambios() {
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`/api/soporte/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editGeneral),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al guardar")
        setLoading(false)
        return
      }

      const actualizado = await res.json()
      setTicket(actualizado)
      setEditando(false)
      router.refresh()
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  async function handleTransicion(estado: string) {
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`/api/soporte/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al cambiar estado")
        setLoading(false)
        return
      }

      const actualizado = await res.json()
      setTicket(actualizado)
      router.refresh()
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-3 rounded-md bg-red-500/15 text-red-400 border border-red-500/25 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{ticket.titulo}</h2>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {ticket.proyecto && <span>Proyecto: {ticket.proyecto.nombre} |</span>}
            <span>Categoría: {ticket.categoria ?? "Sin categoría"}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {puedeEditar && !editando && (
            <button
              onClick={() => setEditando(true)}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-muted"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORIDAD_BADGES[ticket.prioridad] ?? ""}`}>
          {ticket.prioridad}
        </span>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_BADGES[ticket.estado] ?? ""}`}>
          {ESTADO_LABELS[ticket.estado] ?? ticket.estado}
        </span>
      </div>

      {editando && (
        <div className="rounded-md border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Editar ticket</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Título</label>
            <input
              value={editGeneral.titulo}
              onChange={(e) => setEditGeneral((p) => ({ ...p, titulo: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              value={editGeneral.descripcion}
              onChange={(e) => setEditGeneral((p) => ({ ...p, descripcion: e.target.value }))}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridad</label>
              <select
                value={editGeneral.prioridad}
                onChange={(e) => setEditGeneral((p) => ({ ...p, prioridad: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <select
                value={editGeneral.categoria}
                onChange={(e) => setEditGeneral((p) => ({ ...p, categoria: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Sin categoría</option>
                <option value="INCIDENTE">Incidente</option>
                <option value="CONSULTA">Consulta</option>
                <option value="SOLICITUD">Solicitud</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={guardarCambios}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              onClick={() => {
                setEditando(false)
                setEditGeneral({
                  titulo: ticket.titulo,
                  descripcion: ticket.descripcion ?? "",
                  prioridad: ticket.prioridad,
                  categoria: ticket.categoria ?? "",
                  clienteNombre: ticket.clienteNombre ?? "",
                })
              }}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Información del ticket</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Creado por:</span>{" "}
            <span className="font-medium">{ticket.creador.nombre} {ticket.creador.apellido}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Fecha de creación:</span>{" "}
            <span className="font-medium">{new Date(ticket.createdAt).toLocaleDateString("es-AR")}</span>
          </div>
          {ticket.asignadoA && (
            <div>
              <span className="text-muted-foreground">Asignado a:</span>{" "}
              <span className="font-medium">{ticket.asignadoA.nombre} {ticket.asignadoA.apellido}</span>
            </div>
          )}
          {ticket.clienteNombre && (
            <div>
              <span className="text-muted-foreground">Cliente:</span>{" "}
              <span className="font-medium">{ticket.clienteNombre}</span>
            </div>
          )}
        </div>
      </section>

      {ticket.descripcion && (
        <section className="space-y-2">
          <h3 className="text-lg font-semibold">Descripción</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.descripcion}</p>
        </section>
      )}

      {puedeEditar && TRANSICIONES[ticket.estado]?.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Cambiar estado</h3>
          <div className="flex gap-2">
            {TRANSICIONES[ticket.estado].map((est) => (
              <button
                key={est}
                onClick={() => handleTransicion(est)}
                disabled={loading}
                className={`inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium disabled:opacity-50 ${
                  est === "CERRADO"
                    ? "bg-gray-600 text-white hover:bg-gray-700"
                    : est === "RESUELTO"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                {ESTADO_LABELS[est] ?? est}
              </button>
            ))}
          </div>
        </section>
      )}

      {puedeEditar && ticket.estado === "ABIERTO" && (
        <button
          onClick={async () => {
            if (!confirm("¿Eliminar este ticket?")) return
            const res = await fetch(`/api/soporte/${ticket.id}`, { method: "DELETE" })
            if (res.ok) router.push("/soporte")
          }}
          className="text-sm text-red-400 hover:text-red-300"
        >
          Eliminar ticket
        </button>
      )}

      <Link href="/soporte" className="inline-block text-sm text-primary hover:underline">
        ← Volver a tickets
      </Link>
    </div>
  )
}
