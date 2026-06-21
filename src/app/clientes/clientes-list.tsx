"use client"

import { useState, useCallback } from "react"
import Link from "next/link"

const SECTORES = [
  "SALUD", "CONTABLE_JURIDICO", "COMERCIAL", "LOGISTICA",
  "AGROINDUSTRIA", "GOBIERNO", "OTRO",
] as const

type Cliente = {
  id: string
  razonSocial: string
  cuit: string
  emailContacto: string | null
  telefono: string | null
  direccion: string | null
  sector: string | null
  activo: boolean
  fechaRegistro: string
  _count: { proyectos: number }
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function ClientesList({
  puedeEditar,
  initialData,
  initialTotal,
}: {
  puedeEditar: boolean
  initialData: Cliente[]
  initialTotal: number
}) {
  const [clientes, setClientes] = useState<Cliente[]>(initialData)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })
  const [search, setSearch] = useState("")
  const [sector, setSector] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchClientes = useCallback(async (p: number, s: string, sec: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(p))
    if (s) params.set("search", s)
    if (sec) params.set("sector", sec)
    params.set("limit", "10")

    const res = await fetch(`/api/clientes?${params}`)
    if (res.ok) {
      const json = await res.json()
      setClientes(json.data)
      setPagination(json.pagination)
    }
    setLoading(false)
  }, [])

  async function handleDesactivar(id: string, razonSocial: string) {
    if (!confirm(`¿Desactivar cliente "${razonSocial}"?`)) return
    const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" })
    if (res.ok) {
      fetchClientes(pagination.page, search, sector)
    } else {
      const json = await res.json()
      alert(json.error || "Error al desactivar cliente")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Buscar por razón social, CUIT o email..."
          value={search}
          onChange={(e) => { const v = e.target.value; setSearch(v); fetchClientes(1, v, sector) }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[250px]"
        />
        <select
          value={sector}
          onChange={(e) => { const v = e.target.value; setSector(v); fetchClientes(1, search, v) }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los sectores</option>
          {SECTORES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">Razón Social</th>
              <th className="text-left p-3 text-sm font-medium">CUIT</th>
              <th className="text-left p-3 text-sm font-medium">Contacto</th>
              <th className="text-left p-3 text-sm font-medium">Sector</th>
              <th className="text-left p-3 text-sm font-medium">Proyectos</th>
              <th className="text-left p-3 text-sm font-medium">Estado</th>
              {puedeEditar && <th className="text-left p-3 text-sm font-medium">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-3 text-sm">{c.razonSocial}</td>
                <td className="p-3 text-sm font-mono">{c.cuit}</td>
                <td className="p-3 text-sm">
                  {c.emailContacto && <div>{c.emailContacto}</div>}
                  {c.telefono && <div className="text-muted-foreground">{c.telefono}</div>}
                </td>
                <td className="p-3 text-sm">{c.sector?.replace(/_/g, " ") ?? "—"}</td>
                <td className="p-3 text-sm">{c._count.proyectos}</td>
                <td className="p-3 text-sm">
                  {c.activo ? (
                    <span className="text-green-600">Activo</span>
                  ) : (
                    <span className="text-red-600">Inactivo</span>
                  )}
                </td>
                {puedeEditar && (
                  <td className="p-3 text-sm">
                    <div className="flex gap-2">
                      <Link
                        href={`/clientes/${c.id}/editar`}
                        className="text-primary hover:underline"
                      >
                        Editar
                      </Link>
                      {c.activo && (
                        <button
                          onClick={() => handleDesactivar(c.id, c.razonSocial)}
                          className="text-danger hover:underline"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {!loading && clientes.length === 0 && (
              <tr>
                <td colSpan={puedeEditar ? 7 : 6} className="p-6 text-center text-sm text-muted-foreground">
                  No se encontraron clientes
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
              onClick={() => { const np = Math.max(1, pagination.page - 1); fetchClientes(np, search, sector) }}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => { const np = Math.min(pagination.totalPages, pagination.page + 1); fetchClientes(np, search, sector) }}
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
