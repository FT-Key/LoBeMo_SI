"use client"

import { useState, useCallback } from "react"
import { SECTORES, SECTORES_LABELS } from "@/shared/validation"
import { FormModal } from "@/components/ui/form-modal"
import { TableActionButton } from "@/components/ui/table-actions"
import { SavedFilters } from "@/components/ui/saved-filters"
import { Pagination, type PaginationInfo } from "@/components/ui/pagination"
import { SearchInput } from "@/components/ui/search-input"
import { FilterSelect } from "@/components/ui/filter-select"
import { NuevoClienteForm } from "@/app/clientes/nuevo/form"
import { EditarClienteForm } from "@/app/clientes/[id]/editar/form"

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
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })
  const [search, setSearch] = useState("")
  const [sector, setSector] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)

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

  async function openEditModal(cliente: Cliente) {
    const res = await fetch(`/api/clientes/${cliente.id}`)
    if (res.ok) {
      const data = await res.json()
      setEditingCliente(data)
      setEditModalOpen(true)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <SearchInput
          placeholder="Buscar por razón social, CUIT o email..."
          value={search}
          onChange={(v) => { setSearch(v); fetchClientes(1, v, sector) }}
        />
        <FilterSelect
          value={sector}
          onChange={(v) => { setSector(v); fetchClientes(1, search, v) }}
          options={SECTORES.map((s) => ({ value: s, label: SECTORES_LABELS[s] || s }))}
          allLabel="Todos los sectores"
        />
        {puedeEditar && (
          <SavedFilters
            modulo="clientes"
            currentFilters={{ search, sector }}
            onApplyFilter={(filters) => {
              setSearch(filters.search ?? "")
              setSector(filters.sector ?? "")
              fetchClientes(1, filters.search ?? "", filters.sector ?? "")
            }}
          />
        )}
        {puedeEditar && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
          >
            Nuevo cliente
          </button>
        )}
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
                <td className="p-3 text-sm">{c.sector ? (SECTORES_LABELS[c.sector] || c.sector) : "—"}</td>
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
                    <div className="flex gap-1">
                      <TableActionButton onClick={() => openEditModal(c)}>
                        Editar
                      </TableActionButton>
                      {c.activo && (
                        <TableActionButton
                          onClick={() => handleDesactivar(c.id, c.razonSocial)}
                          variant="danger"
                        >
                          Desactivar
                        </TableActionButton>
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

      <Pagination
        pagination={pagination}
        onPageChange={(p) => fetchClientes(p, search, sector)}
      />

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo cliente">
        <NuevoClienteForm onSuccess={() => { setModalOpen(false); fetchClientes(1, search, sector) }} />
      </FormModal>

      {editingCliente && (
        <FormModal open={editModalOpen} onClose={() => { setEditModalOpen(false); setEditingCliente(null) }} title="Editar cliente">
          <EditarClienteForm cliente={editingCliente} onSuccess={() => { setEditModalOpen(false); setEditingCliente(null); fetchClientes(pagination.page, search, sector) }} />
        </FormModal>
      )}
    </div>
  )
}
