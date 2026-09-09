"use client"

import { useState, useCallback } from "react"
import { FormModal } from "@/components/ui/form-modal"
import { TableActionLink } from "@/components/ui/table-actions"
import { CapacitacionForm } from "@/components/capacitaciones/capacitacion-form"
import { Pagination, type PaginationInfo } from "@/components/ui/pagination"
import { SearchInput } from "@/components/ui/search-input"
import { FilterSelect } from "@/components/ui/filter-select"

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

export function CapacitacionList({
  initialData,
  initialTotal,
  proyectos,
  puedeCrear,
}: {
  initialData: Capacitacion[]
  initialTotal: number
  proyectos: { id: string; nombre: string }[]
  puedeCrear?: boolean
}) {
  const [capacitaciones, setCapacitaciones] = useState<Capacitacion[]>(initialData)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })
  const [search, setSearch] = useState("")
  const [estado, setEstado] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

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
          <SearchInput
            value={search}
            onChange={setSearch}
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
        <FilterSelect
          value={estado}
          onChange={(v) => {
            setEstado(v)
            fetchCapacitaciones(1, search, v)
          }}
          options={ESTADOS.map((e) => ({ value: e, label: ESTADO_LABELS[e] }))}
          allLabel="Todos los estados"
        />
        {puedeCrear && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
          >
            Nueva capacitación
          </button>
        )}
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
                  <TableActionLink href={`/capacitaciones/${c.id}`}>
                    Ver detalle
                  </TableActionLink>
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

      <Pagination
        pagination={pagination}
        onPageChange={(p) => fetchCapacitaciones(p, search, estado)}
      />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva capacitación" maxWidth="max-w-xl">
        <CapacitacionForm
          proyectos={proyectos}
          onSuccess={() => { setModalOpen(false); fetchCapacitaciones(1, search, estado) }}
        />
      </FormModal>
    </div>
  )
}
