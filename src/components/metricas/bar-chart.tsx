"use client"

const COLORS: Record<string, string> = {
  PENDIENTE: "bg-yellow-500",
  EN_PROGRESO: "bg-blue-500",
  COMPLETADA: "bg-green-500",
  CANCELADA: "bg-red-500",
  BAJA: "bg-green-500",
  MEDIA: "bg-blue-500",
  ALTA: "bg-orange-500",
  CRITICA: "bg-red-500",
}

export function BarChart({
  data,
  title,
}: {
  data: Record<string, number>
  title: string
}) {
  const entries = Object.entries(data)
  const maxVal = Math.max(...entries.map(([, v]) => v), 1)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
      <div className="space-y-2">
        {entries.map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium capitalize">{key.replace(/_/g, " ").toLowerCase()}</span>
              <span className="text-muted-foreground">{value}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${COLORS[key] ?? "bg-primary"}`}
                style={{ width: `${(value / maxVal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ProgressBar({
  value,
  label,
  color = "bg-primary",
}: {
  value: number
  label: string
  color?: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  )
}
