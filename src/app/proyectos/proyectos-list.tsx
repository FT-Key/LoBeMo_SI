"use client"

import { useState, useCallback } from "react"
import Link from "next/link"

const ESTADOS = [
  "RELEVAMIENTO", "PROPUESTA", "APROBADO", "EN_EJECUCION",
  "EN_REVISION", "ENTREGADO", "CERRADO",
] as const

const ESTADO_BADGES: Record<string, string> = {
  RELEVAMIENTO: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  PROPUESTA: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
  APROBADO: "bg-green-500/15 text-green-400 border border-green-500/25",
  EN_EJECUCION: "bg-teal-500/15 text-teal-400 border border-teal-500/25",
  EN_REVISION: "bg-purple-500/15 text-purple-400 border border-purple-500/25",
  ENTREGADO: "bg-primary/15 text-primary border border-primary/25",
  CERRADO: "bg-muted text-muted-foreground border border-border",
}

type Proyecto = {
  id: string
  nombre: string
  descripcion: string | null
  estado: string
  fechaInicio: string
  fechaEstimadaFin: string | null
  montoAcordado: string | null
  cliente: { id: string; razonSocial: string }
  servicio: { id: string; nombre: string }
  _count: { tareas: number; asignaciones: number; propuestas: number }
  historialEstados: { estadoNuevo: string; createdAt: string }[]
}

type Cliente = { id: string; razonSocial: string }
type Servicio = { id: string; nombre: string }

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function ProyectosList({
  initialData,
  initialTotal,
  clientes,
  servicios,
  estadoLabels,
}: {
  initialData: Proyecto[]
  initialTotal: number
  clientes: Cliente[]
  servicios: Servicio[]
  estadoLabels: Record<string, string>
}) {
  const [proyectos, setProyectos] = useState<Proyecto[]>(initialData)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })
  const [search, setSearch] = useState("")
  const [estado, setEstado] = useState("")
  const [clienteId, setClienteId] = useState("")
  const [servicioId, setServicioId] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchProyectos = useCallback(async (p: number, s: string, e: string, c: string, sv: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(p))
    if (s) params.set("search", s)
    if (e) params.set("estado", e)
    if (c) params.set("clienteId", c)
    if (sv) params.set("servicioId", sv)
    params.set("limit", "10")

    const res = await fetch(`/api/proyectos?${params}`)
    if (res.ok) {
      const json = await res.json()
      setProyectos(json.data)
      setPagination(json.pagination)
    }
    setLoading(false)
  }, [])

  function handleFilter(param: string, value: string, setter: (v: string) => void) {
    setter(value)
    fetchProyectos(1, param === "search" ? value : search, param === "estado" ? value : estado, param === "clienteId" ? value : clienteId, param === "servicioId" ? value : servicioId)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Buscar proyecto..."
          value={search}
          onChange={(e) => handleFilter("search", e.target.value, setSearch)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[200px]"
        />
        <select
          value={estado}
          onChange={(e) => handleFilter("estado", e.target.value, setEstado)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{estadoLabels[e] ?? e}</option>
          ))}
        </select>
        <select
          value={clienteId}
          onChange={(e) => handleFilter("clienteId", e.target.value, setClienteId)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los clientes</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.razonSocial}</option>
          ))}
        </select>
        <select
          value={servicioId}
          onChange={(e) => handleFilter("servicioId", e.target.value, setServicioId)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los servicios</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">Nombre</th>
              <th className="text-left p-3 text-sm font-medium">Cliente</th>
              <th className="text-left p-3 text-sm font-medium">Servicio</th>
              <th className="text-left p-3 text-sm font-medium">Estado</th>
              <th className="text-left p-3 text-sm font-medium">Tareas</th>
              <th className="text-left p-3 text-sm font-medium">Inicio</th>
              <th className="text-left p-3 text-sm font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proyectos.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3 text-sm font-medium">{p.nombre}</td>
                <td className="p-3 text-sm">{p.cliente.razonSocial}</td>
                <td className="p-3 text-sm">{p.servicio.nombre.replace(/_/g, " ")}</td>
                <td className="p-3 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_BADGES[p.estado] ?? ""}`}>
                    {estadoLabels[p.estado] ?? p.estado}
                  </span>
                </td>
                <td className="p-3 text-sm">{p._count.tareas}</td>
                <td className="p-3 text-sm">{new Date(p.fechaInicio).toLocaleDateString("es-AR")}</td>
                <td className="p-3 text-sm">
                  <Link href={`/proyectos/${p.id}`} className="text-primary hover:underline">
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && proyectos.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">
                  No se encontraron proyectos
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
              onClick={() => { const np = Math.max(1, pagination.page - 1); fetchProyectos(np, search, estado, clienteId, servicioId) }}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => { const np = Math.min(pagination.totalPages, pagination.page + 1); fetchProyectos(np, search, estado, clienteId, servicioId) }}
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
