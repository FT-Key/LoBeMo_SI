"use client"

import { useState, useCallback } from "react"
import Link from "next/link"

const ESTADOS = ["ENVIADA", "ACEPTADA", "RECHAZADA", "RECOTIZADA"] as const

const ESTADO_BADGES: Record<string, string> = {
  ENVIADA: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  ACEPTADA: "bg-green-500/15 text-green-400 border border-green-500/25",
  RECHAZADA: "bg-red-500/15 text-red-400 border border-red-500/25",
  RECOTIZADA: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
}

type Propuesta = {
  id: string
  version: number
  montoTotal: string
  estado: string
  fechaEmision: string
  fechaVencimiento: string
  createdAt: string
  proyecto: {
    id: string
    nombre: string
    estado: string
    cliente: { razonSocial: string }
  }
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function PropuestasList({
  initialData,
  initialTotal,
  estadoLabels,
}: {
  initialData: Propuesta[]
  initialTotal: number
  estadoLabels: Record<string, string>
}) {
  const [propuestas, setPropuestas] = useState<Propuesta[]>(initialData)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })
  const [search, setSearch] = useState("")
  const [estado, setEstado] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchPropuestas = useCallback(async (p: number, s: string, e: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(p))
    if (s) params.set("search", s)
    if (e) params.set("estado", e)
    params.set("limit", "10")

    const res = await fetch(`/api/propuestas?${params}`)
    if (res.ok) {
      const json = await res.json()
      setPropuestas(json.data)
      setPagination(json.pagination)
    }
    setLoading(false)
  }, [])

  function handleFilter(param: string, value: string, setter: (v: string) => void) {
    setter(value)
    fetchPropuestas(1, param === "search" ? value : search, param === "estado" ? value : estado)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Buscar por proyecto..."
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
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">Proyecto</th>
              <th className="text-left p-3 text-sm font-medium">Cliente</th>
              <th className="text-left p-3 text-sm font-medium">Versión</th>
              <th className="text-left p-3 text-sm font-medium">Monto</th>
              <th className="text-left p-3 text-sm font-medium">Estado</th>
              <th className="text-left p-3 text-sm font-medium">Vencimiento</th>
              <th className="text-left p-3 text-sm font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {propuestas.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3 text-sm font-medium">{p.proyecto.nombre}</td>
                <td className="p-3 text-sm">{p.proyecto.cliente.razonSocial}</td>
                <td className="p-3 text-sm">v{p.version}</td>
                <td className="p-3 text-sm">
                  ARS {Number(p.montoTotal).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </td>
                <td className="p-3 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_BADGES[p.estado] ?? ""}`}>
                    {estadoLabels[p.estado] ?? p.estado}
                  </span>
                </td>
                <td className="p-3 text-sm">{new Date(p.fechaVencimiento).toLocaleDateString("es-AR")}</td>
                <td className="p-3 text-sm">
                  <Link href={`/propuestas/${p.id}`} className="text-primary hover:underline">
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && propuestas.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">
                  No se encontraron propuestas
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
              onClick={() => { const np = Math.max(1, pagination.page - 1); fetchPropuestas(np, search, estado) }}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => { const np = Math.min(pagination.totalPages, pagination.page + 1); fetchPropuestas(np, search, estado) }}
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
