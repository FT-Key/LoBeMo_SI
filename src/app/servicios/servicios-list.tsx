"use client"

import { useState, useCallback } from "react"
import { Pagination, type PaginationInfo } from "@/components/ui/pagination"
import { SearchInput } from "@/components/ui/search-input"
import { FormModal } from "@/components/ui/form-modal"
import { NuevoServicioForm } from "./nuevo-servicio-form"

const NOMBRES_SERVICIOS: Record<string, string> = {
  AUDITORIA_ISO27001: "Auditoría ISO 27001",
  PENTESTING: "Pentesting",
  DESARROLLO_SEGURO: "Desarrollo Seguro",
  CONSULTORIA_REDES: "Consultoría en Redes",
  CAPACITACION: "Capacitación",
  SOPORTE_TECNICO: "Soporte Técnico",
}

type Servicio = {
  id: string
  nombre: string
  descripcion: string | null
  precioBase: string | null
  _count: { proyectos: number }
}

export function ServiciosList({
  esGerenteGeneral,
  initialData,
  initialTotal,
}: {
  esGerenteGeneral: boolean
  initialData: Servicio[]
  initialTotal: number
}) {
  const [servicios, setServicios] = useState<Servicio[]>(initialData)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDescripcion, setEditDescripcion] = useState("")
  const [editPrecio, setEditPrecio] = useState("")
  const [saving, setSaving] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchServicios = useCallback(async (p: number, s: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(p))
    if (s) params.set("search", s)
    params.set("limit", "10")

    const res = await fetch(`/api/servicios?${params}`)
    if (res.ok) {
      const json = await res.json()
      setServicios(json.data)
      setPagination(json.pagination)
    }
    setLoading(false)
  }, [])

  async function handleSave(id: string) {
    setSaving(true)
    const res = await fetch(`/api/servicios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        descripcion: editDescripcion,
        precioBase: editPrecio ? parseFloat(editPrecio) : null,
      }),
    })
    if (res.ok) {
      setEditingId(null)
      fetchServicios(pagination.page, search)
    } else {
      const json = await res.json()
      alert(json.error || "Error al guardar")
    }
    setSaving(false)
  }

  async function handleEliminar(id: string, nombre: string) {
    if (!confirm(`¿Eliminar servicio "${NOMBRES_SERVICIOS[nombre] ?? nombre}"?`)) return
    const res = await fetch(`/api/servicios/${id}`, { method: "DELETE" })
    if (res.ok) {
      fetchServicios(pagination.page, search)
    } else {
      const json = await res.json()
      alert(json.error || "Error al eliminar servicio")
    }
  }

  function startEdit(s: Servicio) {
    setEditingId(s.id)
    setEditDescripcion(s.descripcion ?? "")
    setEditPrecio(s.precioBase ?? "")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <SearchInput
          placeholder="Buscar servicio..."
          value={search}
          onChange={(v) => { setSearch(v); fetchServicios(1, v) }}
        />
        {esGerenteGeneral && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-4 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90"
          >
            Nuevo servicio
          </button>
        )}
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">Nombre</th>
              <th className="text-left p-3 text-sm font-medium">Descripción</th>
              <th className="text-left p-3 text-sm font-medium">Precio Base</th>
              <th className="text-left p-3 text-sm font-medium">Proyectos</th>
              {esGerenteGeneral && <th className="text-left p-3 text-sm font-medium">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {servicios.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="p-3 text-sm font-medium">
                  {NOMBRES_SERVICIOS[s.nombre] ?? s.nombre}
                </td>
                <td className="p-3 text-sm">
                  {editingId === s.id ? (
                    <textarea
                      value={editDescripcion}
                      onChange={(e) => setEditDescripcion(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                    />
                  ) : (
                    s.descripcion ?? "—"
                  )}
                </td>
                <td className="p-3 text-sm">
                  {editingId === s.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editPrecio}
                      onChange={(e) => setEditPrecio(e.target.value)}
                      placeholder="0.00"
                      className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  ) : (
                    s.precioBase != null
                      ? `ARS ${Number(s.precioBase).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`
                      : "—"
                  )}
                </td>
                <td className="p-3 text-sm">{s._count.proyectos}</td>
                {esGerenteGeneral && (
                  <td className="p-3 text-sm">
                    {editingId === s.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(s.id)}
                          disabled={saving}
                          className="text-primary hover:underline disabled:opacity-50"
                        >
                          {saving ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-muted-foreground hover:underline"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(s)}
                          className="text-primary hover:underline"
                        >
                          Editar
                        </button>
                        {s._count.proyectos === 0 && (
                          <button
                            onClick={() => handleEliminar(s.id, s.nombre)}
                            className="text-danger hover:underline"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {!loading && servicios.length === 0 && (
              <tr>
                <td colSpan={esGerenteGeneral ? 5 : 4} className="p-6 text-center text-sm text-muted-foreground">
                  No se encontraron servicios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        pagination={pagination}
        onPageChange={(p) => fetchServicios(p, search)}
      />

      <FormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nuevo servicio"
      >
        <NuevoServicioForm
          onSuccess={() => {
            setShowCreateModal(false)
            fetchServicios(1, search)
          }}
        />
      </FormModal>
    </div>
  )
}
