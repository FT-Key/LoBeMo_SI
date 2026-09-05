"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { FormModal } from "@/components/ui/form-modal"
import { InformeAuditoriaForm } from "@/components/informes-auditoria/informe-auditoria-form"

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
  puedeCrear,
}: {
  initialData: InformeAuditoria[]
  initialTotal: number
  proyectos: Proyecto[]
  puedeCrear?: boolean
}) {
  const [informes, setInformes] = useState<InformeAuditoria[]>(initialData)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })
  const [search, setSearch] = useState("")
  const [proyectoId, setProyectoId] = useState("")
  const [estado, setEstado] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchInformes = useCallback(
    async (p: number, s: string, pid: string, e: string) => {
      setLoading(true)
      const params = new URLSearchParams()
      params.set("page", String(p))
      params.set("limit", "10")
      if (s) params.set("search", s)
      if (pid) params.set("proyectoId", pid)
      if (e) params.set("estado", e)

      const res = await fetch(`/api/informes-auditoria?${params}`)
      if (res.ok) {
        const json = await res.json()
        setInformes(json.data)
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
          placeholder="Buscar por alcance o proyecto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchInformes(1, search, proyectoId, estado)
          }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-64"
        />
        <select
          value={proyectoId}
          onChange={(e) => {
            setProyectoId(e.target.value)
            fetchInformes(1, search, e.target.value, estado)
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
            fetchInformes(1, search, proyectoId, e.target.value)
          }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e === "BORRADOR" ? "Borrador" : "Completado"}</option>
          ))}
        </select>
        <button
          onClick={() => fetchInformes(1, search, proyectoId, estado)}
          className="h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
        >
          Buscar
        </button>
        {puedeCrear && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
          >
            Nuevo informe
          </button>
        )}
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">Proyecto</th>
              <th className="text-left p-3 text-sm font-medium hidden sm:table-cell">Alcance</th>
              <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Creador</th>
              <th className="text-left p-3 text-sm font-medium">Estado</th>
              <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">Fecha</th>
              <th className="text-left p-3 text-sm font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {informes.map((inf) => (
              <tr key={inf.id} className="border-b last:border-0">
                <td className="p-3 text-sm font-medium">
                  <div>{inf.proyecto.nombre}</div>
                  <div className="text-xs text-muted-foreground sm:hidden max-w-[200px] truncate">{inf.alcance}</div>
                </td>
                <td className="p-3 text-sm max-w-[200px] truncate hidden sm:table-cell">{inf.alcance}</td>
                <td className="p-3 text-sm hidden md:table-cell">{inf.creador.nombre} {inf.creador.apellido}</td>
                <td className="p-3 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTADO_BADGES[inf.estado] ?? ""}`}>
                    {inf.estado === "BORRADOR" ? "Borrador" : "Completado"}
                  </span>
                </td>
                <td className="p-3 text-sm hidden lg:table-cell">
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm">
          <span className="text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => { const np = Math.max(1, pagination.page - 1); fetchInformes(np, search, proyectoId, estado) }}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => { const np = Math.min(pagination.totalPages, pagination.page + 1); fetchInformes(np, search, proyectoId, estado) }}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo informe de auditoría" maxWidth="max-w-xl">
        <InformeAuditoriaForm
          proyectos={proyectos}
          onSuccess={() => { setModalOpen(false); fetchInformes(1, search, proyectoId, estado) }}
        />
      </FormModal>
    </div>
  )
}
