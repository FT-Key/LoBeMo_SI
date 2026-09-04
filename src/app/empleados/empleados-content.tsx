"use client"

import { useState, useCallback } from "react"

const ROLES: Record<string, string> = {
  GERENTE_GENERAL: "Gerente General",
  ADMINISTRACION: "Administración",
  VENTAS: "Ventas",
  CISO: "CISO",
  ANALISTA_SEGURIDAD: "Analista de Seguridad",
  DESARROLLADOR: "Desarrollador",
  ESPECIALISTA_REDES: "Especialista en Redes",
  PENTESTER: "Pentester",
  SOPORTE_TECNICO: "Soporte Técnico",
  AUDITOR: "Auditor",
  CAPACITADOR: "Capacitador",
}

const AREAS: Record<string, string> = {
  GERENCIA: "Gerencia",
  ADMINISTRACION: "Administración",
  COMERCIAL: "Comercial",
  SISTEMAS: "Sistemas",
  AUDITORIA: "Auditoría",
  CAPACITACION: "Capacitación",
}

type Empleado = {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: string
  area: string
  activo: boolean
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function EmpleadosContent({
  initialData,
  initialTotal,
}: {
  initialData: Empleado[]
  initialTotal: number
}) {
  const [empleados, setEmpleados] = useState<Empleado[]>(initialData)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })
  const [search, setSearch] = useState("")
  const [rol, setRol] = useState("")
  const [area, setArea] = useState("")
  const [activo, setActivo] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchEmpleados = useCallback(
    async (p: number, s: string, r: string, a: string, act: string) => {
      setLoading(true)
      const params = new URLSearchParams()
      params.set("page", String(p))
      params.set("limit", "10")
      if (s) params.set("search", s)
      if (r) params.set("rol", r)
      if (a) params.set("area", a)
      if (act) params.set("activo", act)

      const res = await fetch(`/api/empleados?${params}`)
      if (res.ok) {
        const json = await res.json()
        setEmpleados(json.data)
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
          placeholder="Buscar por nombre, apellido o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchEmpleados(1, search, rol, area, activo)
          }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-64"
        />
        <select
          value={rol}
          onChange={(e) => {
            setRol(e.target.value)
            fetchEmpleados(1, search, e.target.value, area, activo)
          }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los roles</option>
          {Object.entries(ROLES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={area}
          onChange={(e) => {
            setArea(e.target.value)
            fetchEmpleados(1, search, rol, e.target.value, activo)
          }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todas las áreas</option>
          {Object.entries(AREAS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={activo}
          onChange={(e) => {
            setActivo(e.target.value)
            fetchEmpleados(1, search, rol, area, e.target.value)
          }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
        <button
          onClick={() => fetchEmpleados(1, search, rol, area, activo)}
          className="h-10 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
        >
          Buscar
        </button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">Nombre</th>
              <th className="text-left p-3 text-sm font-medium hidden sm:table-cell">Email</th>
              <th className="text-left p-3 text-sm font-medium">Rol</th>
              <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Área</th>
              <th className="text-left p-3 text-sm font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((emp) => (
              <tr key={emp.id} className="border-b last:border-0">
                <td className="p-3 text-sm">
                  <div>{emp.nombre} {emp.apellido}</div>
                  <div className="text-xs text-muted-foreground sm:hidden">{emp.email}</div>
                </td>
                <td className="p-3 text-sm hidden sm:table-cell">{emp.email}</td>
                <td className="p-3 text-sm">{ROLES[emp.rol] ?? emp.rol}</td>
                <td className="p-3 text-sm hidden md:table-cell">{AREAS[emp.area] ?? emp.area}</td>
                <td className="p-3 text-sm">
                  {emp.activo ? (
                    <span className="inline-flex items-center rounded-full bg-green-500/15 text-green-400 border border-green-500/25 px-2 py-0.5 text-xs font-semibold">Activo</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-500/15 text-red-400 border border-red-500/25 px-2 py-0.5 text-xs font-semibold">Inactivo</span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && empleados.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                  No hay empleados registrados
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
              onClick={() => { const np = Math.max(1, pagination.page - 1); fetchEmpleados(np, search, rol, area, activo) }}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => { const np = Math.min(pagination.totalPages, pagination.page + 1); fetchEmpleados(np, search, rol, area, activo) }}
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
