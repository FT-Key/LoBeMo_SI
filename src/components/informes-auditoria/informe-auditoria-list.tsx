"use client"

import { useState, useCallback } from "react"
import Link from "next/link"

const ESTADOS = ["BORRADOR", "COMPLETADO"] as const

const ESTADO_BADGES: Record<string, string> = {
  BORRADOR: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
  COMPLETADO: "bg-green-500/15 text-green-400 border border-green-500/25",
}

type InformeAuditoria = {
  id: string
  alcance: string
  estado: string
  fechaEmision: string | null
  createdAt: string
  proyecto: { id: string; nombre: string }
  creador: { id: string; nombre: string; apellido: string; rol: string }
}

type Proyecto = { id: string; nombre: string }

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function InformeAuditoriaList({
  initialData,
  initialTotal,
  proyectos,
}: {
  initialData: InformeAuditoria[]
  initialTotal: number
  proyectos: Proyecto[]
}) {
  const [informes, setInformes] = useState<InformeAuditoria[]>(initialData)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })
  const [proyectoId, setProyectoId] = useState("")
  const [estado, setEstado] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchInformes = useCallback(async (p: number, pid: string, e: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(p))
    if (pid) params.set("proyectoId", pid)
    if (e) params.set("estado", e)
    params.set("limit", "10")

    const res = await fetch(`/api/informes-auditoria?${params}`)
    if (res.ok) {
      const json = await res.json()
      setInformes(json.data)
      setPagination(json.pagination)
    }
    setLoading(false)
  }, [])

  function handleFilter(param: string, value: string, setter: (v: string) => void) {
    setter(value)
    fetchInformes(
      1,
      param === "proyectoId" ? value : proyectoId,
      param === "estado" ? value : estado
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <select
          value={proyectoId}
          onChange={(e) => handleFilter("proyectoId", e.target.value, setProyectoId)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los proyectos</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
        <select
          value={estado}
          onChange={(e) => handleFilter("estado", e.target.value, setEstado)}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e === "BORRADOR" ? "Borrador" : "Completado"}</option>
          ))}
        </select>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">Proyecto</th>
              <th className="text-left p-3 text-sm font-medium">Alcance</th>
              <th className="text-left p-3 text-sm font-medium">Creador</th>
              <th className="text-left p-3 text-sm font-medium">Estado</th>
              <th className="text-left p-3 text-sm font-medium">Fecha</th>
              <th className="text-left p-3 text-sm font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {informes.map((inf) => (
              <tr key={inf.id} className="border-b last:border-0">
                <td className="p-3 text-sm font-medium">{inf.proyecto.nombre}</td>
                <td className="p-3 text-sm max-w-[200px] truncate">{inf.alcance}</td>
                <td className="p-3 text-sm">{inf.creador.nombre} {inf.creador.apellido}</td>
                <td className="p-3 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_BADGES[inf.estado] ?? ""}`}>
                    {inf.estado === "BORRADOR" ? "Borrador" : "Completado"}
                  </span>
                </td>
                <td className="p-3 text-sm">
                  {inf.fechaEmision
                    ? new Date(inf.fechaEmision).toLocaleDateString("es-AR")
                    : new Date(inf.createdAt).toLocaleDateString("es-AR")}
                </td>
                <td className="p-3 text-sm">
                  <Link href={`/informes-auditoria/${inf.id}`} className="text-primary hover:underline">
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && informes.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                  No se encontraron informes de auditoría
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
              onClick={() => { const np = Math.max(1, pagination.page - 1); fetchInformes(np, proyectoId, estado) }}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => { const np = Math.min(pagination.totalPages, pagination.page + 1); fetchInformes(np, proyectoId, estado) }}
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
