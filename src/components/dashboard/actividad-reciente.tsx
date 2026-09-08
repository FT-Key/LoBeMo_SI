"use client"

import { useQuery } from "@tanstack/react-query"
import { History, Loader2 } from "lucide-react"

const ACCION_BADGES: Record<string, string> = {
  CREATE: "bg-green-500/15 text-green-400 border border-green-500/25",
  UPDATE: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  DELETE: "bg-red-500/15 text-red-400 border border-red-500/25",
}

type Actividad = {
  id: string
  accion: string
  entidad: string
  entidadId: string
  createdAt: string
  empleado: { id: string; nombre: string; apellido: string; email: string } | null
}

function tiempoRelativo(fechaISO: string): string {
  const ahora = Date.now()
  const fecha = new Date(fechaISO).getTime()
  const diffMs = Math.max(0, ahora - fecha)
  const minutos = Math.floor(diffMs / 60000)
  if (minutos < 1) return "ahora mismo"
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias < 30) return `hace ${dias} d`
  return new Date(fechaISO).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function iniciales(nombre?: string, apellido?: string): string {
  const n = (nombre ?? "").trim().charAt(0)
  const a = (apellido ?? "").trim().charAt(0)
  return `${n}${a}`.toUpperCase() || "?"
}

export function ActividadReciente() {
  const { data, isLoading, isError } = useQuery<{ data: Actividad[] }>({
    queryKey: ["dashboard-actividad"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/actividad")
      if (!res.ok) throw new Error("Error al cargar actividad")
      return res.json()
    },
    staleTime: 60_000,
  })

  const logs = data?.data ?? []

  return (
    <div className="rounded-2xl border border-border bg-surface/50 backdrop-blur-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <History className="size-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Actividad Reciente</h3>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Cargando actividad...
        </div>
      )}

      {isError && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No se pudo cargar la actividad reciente
        </p>
      )}

      {!isLoading && !isError && logs.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Sin actividad registrada
        </p>
      )}

      {!isLoading && !isError && logs.length > 0 && (
        <ul className="space-y-3">
          {logs.map((log) => (
            <li
              key={log.id}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors duration-150"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
                title={log.empleado ? `${log.empleado.nombre} ${log.empleado.apellido}` : "Sistema"}
              >
                {log.empleado ? iniciales(log.empleado.nombre, log.empleado.apellido) : "•"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${ACCION_BADGES[log.accion] ?? "bg-muted text-muted-foreground border border-border"}`}
                  >
                    {log.accion}
                  </span>
                  <span className="text-sm font-medium text-foreground truncate">
                    {log.entidad}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {log.empleado
                    ? `${log.empleado.nombre} ${log.empleado.apellido}`
                    : "Sistema"}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {tiempoRelativo(log.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
