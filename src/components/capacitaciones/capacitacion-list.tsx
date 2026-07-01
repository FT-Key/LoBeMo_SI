"use client"

import { useState, useCallback } from "react"
import Link from "next/link"

const ESTADOS = ["PLANIFICADA", "EN_CURSO", "COMPLETADA", "CANCELADA"]

const ESTADO_BADGES: Record<string, string> = {
  PLANIFICADA: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  EN_CURSO: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
  COMPLETADA: "bg-green-500/15 text-green-400 border border-green-500/25",
  CANCELADA: "bg-red-500/15 text-red-400 border border-red-500/25",
}

const ESTADO_LABELS: Record<string, string> = {
  PLANIFICADA: "Planificada",
  EN_CURSO: "En curso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
}

const MODALIDAD_BADGES: Record<string, string> = {
  PRESENCIAL: "bg-purple-500/15 text-purple-400 border border-purple-500/25",
  REMOTA: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25",
}

type Capacitacion = {
  id: string
  titulo: string
  modalidad: string
  estado: string
  duracionHoras: number
  fechaInicio: string
  fechaFin: string | null
  proyecto: { id: string; nombre: string } | null
  _count: { asistentes: number }
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function CapacitacionList({
  initialData,
  initialTotal,
}: {
  initialData: Capacitacion[]
  initialTotal: number
}) {
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>(initialData)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })
  const [search, setSearch] = useState("")
  const [estado, setEstado] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchCapacitaciones = useCallback(async (p: number, s: string, e: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(p))
    if (s) params.set("search", s)
    if (e) params.set("estado", e)
    params.set("limit", "10")

    const res = await fetch(`/api/capacitaciones?${params}`)
    if (res.ok) {
      const json = await res.json()
      setCapacitaciones(json.data)
      setPagination(json.pagination)
    }
    setLoading(false)
  }, [])

  function handleSearch() {
    fetchCapacitaciones(1, search, estado)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch() }}
            placeholder="Buscar capacitaciones..."
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-64"
          />
          <button
            onClick={handleSearch}
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Buscar
          </button>
        </div>
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value)
            fetchCapacitaciones(1, search, e.target.value)
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
          ))}
        </select>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">Título</th>
              <th className="text-left p-3 text-sm font-medium">Proyecto</th>
              <th className="text-left p-3 text-sm font-medium">Modalidad</th>
              <th className="text-left p-3 text-sm font-medium">Estado</th>
              <th className="text-left p-3 text-sm font-medium">Duración</th>
              <th className="text-left p-3 text-sm font-medium">Asistentes</th>
              <th className="text-left p-3 text-sm font-medium">Inicio</th>
              <th className="text-left p-3 text-sm font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {capacitaciones.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-3 text-sm font-medium">{c.titulo}</td>
                <td className="p-3 text-sm text-muted-foreground">
                  {c.proyecto?.nombre ?? "—"}
                </td>
                <td className="p-3 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${MODALIDAD_BADGES[c.modalidad] ?? ""}`}>
                    {c.modalidad === "PRESENCIAL" ? "Presencial" : "Remota"}
                  </span>
                </td>
                <td className="p-3 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_BADGES[c.estado] ?? ""}`}>
                    {ESTADO_LABELS[c.estado] ?? c.estado}
                  </span>
                </td>
                <td className="p-3 text-sm">{c.duracionHoras}h</td>
                <td className="p-3 text-sm">{c._count.asistentes}</td>
                <td className="p-3 text-sm">{new Date(c.fechaInicio).toLocaleDateString("es-AR")}</td>
                <td className="p-3 text-sm">
                  <Link href={`/capacitaciones/${c.id}`} className="text-primary hover:underline">
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && capacitaciones.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-sm text-muted-foreground">
                  No se encontraron capacitaciones
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
              onClick={() => { const np = Math.max(1, pagination.page - 1); fetchCapacitaciones(np, search, estado) }}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => { const np = Math.min(pagination.totalPages, pagination.page + 1); fetchCapacitaciones(np, search, estado) }}
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
