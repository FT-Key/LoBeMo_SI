"use client"

import { useState, useCallback } from "react"

const ACCION_BADGES: Record<string, string> = {
  CREATE: "bg-green-500/15 text-green-400 border border-green-500/25",
  UPDATE: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  DELETE: "bg-red-500/15 text-red-400 border border-red-500/25",
}

type AuditEntry = {
  id: string
  accion: string
  entidad: string
  entidadId: string
  detalle: Record<string, unknown> | null
  empleado: { id: string; nombre: string; apellido: string; email: string } | null
  createdAt: string
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function AuditLogList({
  initialData,
  initialTotal,
}: {
  initialData: AuditEntry[]
  initialTotal: number
}) {
  const [logs, setLogs] = useState<AuditEntry[]>(initialData)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 10),
  })
  const [entidad, setEntidad] = useState("")
  const [accion, setAccion] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchLogs = useCallback(async (p: number, e: string, a: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(p))
    if (e) params.set("entidad", e)
    if (a) params.set("accion", a)
    params.set("limit", "10")

    try {
      const res = await fetch(`/api/audit-log?${params}`)
      if (res.ok) {
        const json = await res.json()
        setLogs(json.data)
        setPagination(json.pagination)
      }
    } catch {
      // Error silencioso — mantiene datos actuales
    }
    setLoading(false)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Filtrar por entidad..."
          value={entidad}
          onChange={(e) => {
            setEntidad(e.target.value)
            fetchLogs(1, e.target.value, accion)
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <select
          value={accion}
          onChange={(e) => {
            setAccion(e.target.value)
            fetchLogs(1, entidad, e.target.value)
          }}
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todas las acciones</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">Fecha</th>
              <th className="text-left p-3 text-sm font-medium">Acción</th>
              <th className="text-left p-3 text-sm font-medium">Entidad</th>
              <th className="text-left p-3 text-sm font-medium">ID</th>
              <th className="text-left p-3 text-sm font-medium">Empleado</th>
              <th className="text-left p-3 text-sm font-medium">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0">
                <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="p-3 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${ACCION_BADGES[log.accion] ?? ""}`}>
                    {log.accion}
                  </span>
                </td>
                <td className="p-3 text-sm font-medium">{log.entidad}</td>
                <td className="p-3 text-sm text-muted-foreground font-mono max-w-[120px] truncate" title={log.entidadId}>
                  {log.entidadId}
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {log.empleado
                    ? `${log.empleado.nombre} ${log.empleado.apellido}`
                    : "—"}
                </td>
                <td className="p-3 text-sm text-muted-foreground max-w-[200px] truncate">
                  {log.detalle ? JSON.stringify(log.detalle) : "—"}
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                  No se encontraron registros de auditoría
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
              onClick={() => { const np = Math.max(1, pagination.page - 1); fetchLogs(np, entidad, accion) }}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded-md border border-input hover:bg-muted disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => { const np = Math.min(pagination.totalPages, pagination.page + 1); fetchLogs(np, entidad, accion) }}
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
