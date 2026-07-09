"use client"

import { useState, useCallback } from "react"
import Link from "next/link"

const ESTADOS = ["ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"]

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
  prioridad: string
  estado: string
  categoria: string | null
  clienteNombre: string | null
  proyecto: { id: string; nombre: string } | null
  creador: { id: string; nombre: string; apellido: string }
  asignadoA: { id: string; nombre: string; apellido: string } | null
  createdAt: string
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function TicketList({
  initialData,
  initialTotal,
}: {
  initialData: Ticket[]
  initialTotal: number
}) {
  const [tickets, setTickets] = useState<Ticket[]>(initialData)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })
  const [estado, setEstado] = useState("")
  const [prioridad, setPrioridad] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchTickets = useCallback(async (p: number, e: string, pr: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(p))
    if (e) params.set("estado", e)
    if (pr) params.set("prioridad", pr)
    params.set("limit", "10")

    const res = await fetch(`/api/soporte?${params}`)
    if (res.ok) {
      const json = await res.json()
      setTickets(json.data)
      setPagination(json.pagination)
    }
    setLoading(false)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value)
            fetchTickets(1, e.target.value, prioridad)
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
          ))}
        </select>
        <select
          value={prioridad}
          onChange={(e) => {
            setPrioridad(e.target.value)
            fetchTickets(1, estado, e.target.value)
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todas las prioridades</option>
          <option value="BAJA">Baja</option>
          <option value="MEDIA">Media</option>
          <option value="ALTA">Alta</option>
          <option value="CRITICA">Crítica</option>
        </select>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">Título</th>
              <th className="text-left p-3 text-sm font-medium">Cliente</th>
              <th className="text-left p-3 text-sm font-medium">Proyecto</th>
              <th className="text-left p-3 text-sm font-medium">Prioridad</th>
              <th className="text-left p-3 text-sm font-medium">Estado</th>
              <th className="text-left p-3 text-sm font-medium">Asignado a</th>
              <th className="text-left p-3 text-sm font-medium">Creado</th>
              <th className="text-left p-3 text-sm font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="p-3 text-sm font-medium">{t.titulo}</td>
                <td className="p-3 text-sm text-muted-foreground">{t.clienteNombre ?? "—"}</td>
                <td className="p-3 text-sm text-muted-foreground">
                  {t.proyecto?.nombre ?? "—"}
                </td>
                <td className="p-3 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${PRIORIDAD_BADGES[t.prioridad] ?? ""}`}>
                    {t.prioridad}
                  </span>
                </td>
                <td className="p-3 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_BADGES[t.estado] ?? ""}`}>
                    {ESTADO_LABELS[t.estado] ?? t.estado}
                  </span>
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {t.asignadoA ? `${t.asignadoA.nombre} ${t.asignadoA.apellido}` : "—"}
                </td>
                <td className="p-3 text-sm">{new Date(t.createdAt).toLocaleDateString("es-AR")}</td>
                <td className="p-3 text-sm">
                  <Link href={`/soporte/${t.id}`} className="text-primary hover:underline">
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && tickets.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-sm text-muted-foreground">
                  No se encontraron tickets de soporte
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => { const np = Math.max(1, pagination.page - 1); fetchTickets(np, estado, prioridad) }}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => { const np = Math.min(pagination.totalPages, pagination.page + 1); fetchTickets(np, estado, prioridad) }}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
