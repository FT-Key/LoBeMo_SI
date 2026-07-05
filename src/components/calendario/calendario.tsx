"use client"

import { useState, useMemo } from "react"

type Evento = {
  id: string
  tipo: "hito" | "vencimiento"
  titulo: string
  fecha: string
  completado?: boolean
  estado?: string
  proyecto: { id: string; nombre: string }
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

export function Calendario({ eventos }: { eventos: Evento[] }) {
  const [mesOffset, setMesOffset] = useState(0)

  const hoy = new Date()
  const añoActual = hoy.getFullYear()
  const mesActualIndex = hoy.getMonth()
  const añoMostrado = mesOffset === 0 ? añoActual : Math.floor((mesActualIndex + mesOffset) / 12) + añoActual
  const mesMostrado = ((mesActualIndex + mesOffset) % 12 + 12) % 12

  const diasEnMes = new Date(añoMostrado, mesMostrado + 1, 0).getDate()
  const primerDiaSemana = new Date(añoMostrado, mesMostrado, 1).getDay()

  const eventosAgrupados = useMemo(() => {
    const map: Record<string, Evento[]> = {}
    for (const e of eventos) {
      const d = new Date(e.fecha)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      if (!map[key]) map[key] = []
      map[key].push(e)
    }
    return map
  }, [eventos])

  const eventosDelDia = (dia: number) => {
    const key = `${añoMostrado}-${String(mesMostrado + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
    return eventosAgrupados[key] ?? []
  }

  const tieneVencimientoHoy = (dia: number) => {
    const evts = eventosDelDia(dia)
    return evts.some((e) => e.tipo === "vencimiento" && e.estado !== "RECHAZADA")
  }
  const tieneHitoHoy = (dia: number) => {
    const evts = eventosDelDia(dia)
    return evts.some((e) => e.tipo === "hito" && !e.completado)
  }

  const esHoy = (dia: number) => {
    const d = new Date()
    return d.getFullYear() === añoMostrado && d.getMonth() === mesMostrado && d.getDate() === dia
  }

  const [eventosSeleccionados, setEventosSeleccionados] = useState<Evento[] | null>(null)
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null)

  const clickDia = (dia: number) => {
    const evts = eventosDelDia(dia)
    setDiaSeleccionado(dia)
    setEventosSeleccionados(evts.length > 0 ? evts : null)
  }

  const dias = []
  for (let i = 0; i < primerDiaSemana; i++) {
    dias.push(<div key={`empty-${i}`} className="min-h-[80px]" />)
  }
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const esSeleccionado = diaSeleccionado === dia
    dias.push(
      <button
        key={dia}
        onClick={() => clickDia(dia)}
        className={`min-h-[80px] rounded-lg border border-border p-1.5 text-left text-sm transition-colors hover:bg-accent relative
          ${esSeleccionado ? "ring-2 ring-primary" : ""}
          ${esHoy(dia) ? "border-primary" : ""}`}
      >
        <span className={`text-xs font-medium ${esHoy(dia) ? "text-primary" : "text-muted-foreground"}`}>
          {dia}
        </span>
        <div className="flex gap-1 mt-1">
          {tieneHitoHoy(dia) && <span className="h-2 w-2 rounded-full bg-blue-500" title="Hito" />}
          {tieneVencimientoHoy(dia) && <span className="h-2 w-2 rounded-full bg-orange-500" title="Vencimiento" />}
        </div>
      </button>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMesOffset((p) => p - 1)}
          className="px-3 py-1.5 rounded-md text-sm font-medium border border-border hover:bg-accent transition-colors"
        >
          &larr; {MESES[(mesMostrado - 1 + 12) % 12]}
        </button>
        <h3 className="text-lg font-semibold">
          {MESES[mesMostrado]} {añoMostrado}
        </h3>
        <button
          onClick={() => setMesOffset((p) => p + 1)}
          className="px-3 py-1.5 rounded-md text-sm font-medium border border-border hover:bg-accent transition-colors"
        >
          {MESES[(mesMostrado + 1) % 12]} &rarr;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2 uppercase tracking-wide">
            {d}
          </div>
        ))}
        {dias}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Hito</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Vencimiento de propuesta</span>
      </div>

      {eventosSeleccionados && (
        <div className="rounded-lg border border-border bg-surface p-4">
          <h4 className="text-sm font-semibold mb-3">
            Eventos del {diaSeleccionado} de {MESES[mesMostrado]} {añoMostrado}
          </h4>
          <div className="space-y-2">
            {eventosSeleccionados.map((e) => (
              <div key={e.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <span
                  className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${e.tipo === "hito" ? "bg-blue-500" : "bg-orange-500"}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.proyecto.nombre}
                    {e.tipo === "hito" && ` — ${e.completado ? "✓ Completado" : "○ Pendiente"}`}
                    {e.tipo === "vencimiento" && ` — ${e.estado?.replace(/_/g, " ")}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
