"use client"

import { useState, useCallback } from "react"
import { FormModal } from "@/components/ui/form-modal"
import { TableActionLink } from "@/components/ui/table-actions"
import { TicketForm } from "@/components/soporte/ticket-form"

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

type Proyecto = { id: string; nombre: string }

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function TicketList({
  initialData,
  initialTotal,
  proyectos,
  empleados,
}: {
  initialData: Ticket[]
  initialTotal: number
  proyectos: Proyecto[]
  empleados: { id: string; nombre: string; apellido: string }[]
}) {
  const [tickets, setTickets] = useState<Ticket[]>(initialData)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })
  const [search, setSearch] = useState("")
  const [proyectoId, setProyectoId] = useState("")
  const [estado, setEstado] = useState("")
  const [prioridad, setPrioridad] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchTickets = useCallback(
    async (p: number, s: string, pid: string, e: string, pr: string) => {
      setLoading(true)
      const params = new URLSearchParams()
      params.set("page", String(p))
      params.set("limit", "10")
      if (s) params.set("search", s)
      if (pid) params.set("proyectoId", pid)
      if (e) params.set("estado", e)
      if (pr) params.set("prioridad", pr)

      const res = await fetch(`/api/soporte?${params}`)
      if (res.ok) {
        const json = await res.json()
        setTickets(json.data)
        setPagination(json.pagination)
      }
      setLoading(false)
    },
    []
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="text"
          placeholder="Buscar por título, cliente o proyecto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchTickets(1, search, proyectoId, estado, prioridad)
          }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-64"
        />
        <select
          value={proyectoId}
          onChange={(e) => {
            setProyectoId(e.target.value)
            fetchTickets(1, search, e.target.value, estado, prioridad)
          }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los proyectos</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value)
            fetchTickets(1, search, proyectoId, e.target.value, prioridad)
          }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            fetchTickets(1, search, proyectoId, estado, e.target.value)
          }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todas las prioridades</option>
          <option value="BAJA">Baja</option>
          <option value="MEDIA">Media</option>
          <option value="ALTA">Alta</option>
          <option value="CRITICA">Crítica</option>
        </select>
        <button
          onClick={() => fetchTickets(1, search, proyectoId, estado, prioridad)}
          className="h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
        >
          Buscar
        </button>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
        >
          Nuevo ticket
        </button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">Título</th>
              <th className="text-left p-3 text-sm font-medium hidden sm:table-cell">Cliente</th>
              <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Proyecto</th>
              <th className="text-left p-3 text-sm font-medium">Prioridad</th>
              <th className="text-left p-3 text-sm font-medium">Estado</th>
              <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">Asignado a</th>
              <th className="text-left p-3 text-sm font-medium hidden xl:table-cell">Creado</th>
              <th className="text-left p-3 text-sm font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="p-3 text-sm font-medium">
                  <div>{t.titulo}</div>
                  <div className="text-xs text-muted-foreground sm:hidden">{t.clienteNombre ?? "—"}</div>
                </td>
                <td className="p-3 text-sm text-muted-foreground hidden sm:table-cell">{t.clienteNombre ?? "—"}</td>
                <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">
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
                <td className="p-3 text-sm text-muted-foreground hidden lg:table-cell">
                  {t.asignadoA ? `${t.asignadoA.nombre} ${t.asignadoA.apellido}` : "—"}
                </td>
                <td className="p-3 text-sm hidden xl:table-cell">{new Date(t.createdAt).toLocaleDateString("es-AR")}</td>
                <td className="p-3 text-sm">
                  <TableActionLink href={`/soporte/${t.id}`}>
                    Ver detalle
                  </TableActionLink>
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm">
          <span className="text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => { const np = Math.max(1, pagination.page - 1); fetchTickets(np, search, proyectoId, estado, prioridad) }}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => { const np = Math.min(pagination.totalPages, pagination.page + 1); fetchTickets(np, search, proyectoId, estado, prioridad) }}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo ticket de soporte" maxWidth="max-w-xl">
        <TicketForm
          empleados={empleados}
          proyectos={proyectos}
          onSuccess={() => { setModalOpen(false); fetchTickets(1, search, proyectoId, estado, prioridad) }}
        />
      </FormModal>
    </div>
  )
}
