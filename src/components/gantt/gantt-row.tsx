"use client"

export type GanttTarea = {
  id: string
  titulo: string
  estado: string
  prioridad: string
  createdAt: string | Date
  fechaLimite: string | Date | null
}

export const TAREA_BAR_COLORS: Record<string, string> = {
  PENDIENTE: "bg-yellow-500/70",
  EN_PROGRESO: "bg-blue-500/70",
  COMPLETADA: "bg-green-500/70",
  CANCELADA: "bg-gray-500/50",
}

type GanttRowProps = {
  tarea: GanttTarea
  rangeStartMs: number
  rangeMs: number
}

export function GanttRow({ tarea, rangeStartMs, rangeMs }: GanttRowProps) {
  const startMs = new Date(tarea.createdAt).getTime()
  const endMs = tarea.fechaLimite ? new Date(tarea.fechaLimite).getTime() : startMs
  const safeRange = rangeMs > 0 ? rangeMs : 1
  const left = Math.max(0, Math.min(100, ((startMs - rangeStartMs) / safeRange) * 100))
  const width = Math.max(2, Math.min(100 - left, ((Math.max(endMs, startMs) - startMs) / safeRange) * 100 || 2))
  const color = TAREA_BAR_COLORS[tarea.estado] ?? "bg-primary/70"

  return (
    <div className="relative h-10">
      <div
        className={`absolute top-1/2 h-6 -translate-y-1/2 rounded-md ${color}`}
        style={{ left: `${left}%`, width: `${width}%` }}
        title={`${tarea.titulo} — ${tarea.estado.replace(/_/g, " ")}${tarea.fechaLimite ? ` (límite: ${new Date(tarea.fechaLimite).toLocaleDateString()})` : " (sin fecha límite)"}`}
      />
    </div>
  )
}
