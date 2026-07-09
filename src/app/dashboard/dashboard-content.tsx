"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

const MAPA_ESTADOS: Record<string, { label: string; color: string }> = {
  RELEVAMIENTO: { label: "Relevamiento", color: "bg-info" },
  PROPUESTA: { label: "Propuesta", color: "bg-warning" },
  APROBADO: { label: "Aprobado", color: "bg-primary" },
  EN_EJECUCION: { label: "En Ejecución", color: "bg-success" },
  EN_REVISION: { label: "En Revisión", color: "bg-accent" },
  ENTREGADO: { label: "Entregado", color: "bg-info" },
  CERRADO: { label: "Cerrado", color: "bg-muted-foreground" },
}

function formatearMonto(monto: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto)
}

type DashboardData = {
  proyectosPorEstado: { estado: string; _count: number }[]
  statsEmpleados: { ocupados: number; disponibles: number; total: number }
  ingresosDelMes: number
  clientesNuevos: number
  periodo: { desde: string; hasta: string }
}

export function DashboardContent({ initialData }: { initialData: DashboardData }) {
  const [desde, setDesde] = useState(initialData.periodo.desde.split("T")[0])
  const [hasta, setHasta] = useState(initialData.periodo.hasta.split("T")[0])

  const { data, isFetching } = useQuery<{ data: DashboardData }>({
    queryKey: ["dashboard", desde, hasta],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (desde) params.set("desde", desde)
      if (hasta) params.set("hasta", hasta)
      const res = await fetch(`/api/dashboard?${params}`)
      if (!res.ok) throw new Error("Error al cargar datos del dashboard")
      return res.json()
    },
    initialData: { data: initialData },
  })

  const dashboard = data?.data ?? initialData
  const maxProyectos = Math.max(
    1,
    ...dashboard.proyectosPorEstado.map((p) => p._count)
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-muted-foreground">Desde:</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
          />
          <label className="text-sm text-muted-foreground">Hasta:</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
          />
          {isFetching && (
            <span className="text-sm text-muted-foreground animate-pulse">
              Actualizando...
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-muted-foreground">Proyectos Activos</p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {dashboard.proyectosPorEstado
              .filter((p) => !["CERRADO", "ENTREGADO"].includes(p.estado))
              .reduce((sum, p) => sum + p._count, 0)}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-muted-foreground">Empleados Ocupados</p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            {dashboard.statsEmpleados.ocupados}
            <span className="text-lg text-muted-foreground">
              {" "}
              / {dashboard.statsEmpleados.total}
            </span>
          </p>
          {dashboard.statsEmpleados.total > 0 && (
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-success transition-all"
                style={{
                  width: `${(dashboard.statsEmpleados.ocupados / dashboard.statsEmpleados.total) * 100}%`,
                }}
              />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-muted-foreground">Ingresos del Mes</p>
          <p className="mt-1 text-3xl font-bold text-success">
            {formatearMonto(Number(dashboard.ingresosDelMes))}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-5">
          <p className="text-sm text-muted-foreground">Clientes Nuevos</p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {dashboard.clientesNuevos}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Proyectos por Estado
        </h3>
        <div className="space-y-3">
          {dashboard.proyectosPorEstado.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay proyectos registrados
            </p>
          )}
          {dashboard.proyectosPorEstado.map((p) => {
            const info = MAPA_ESTADOS[p.estado] ?? {
              label: p.estado,
              color: "bg-muted-foreground",
            }
            const porcentaje = (p._count / maxProyectos) * 100
            return (
              <div key={p.estado}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${info.color}`}
                    />
                    <span className="text-foreground">{info.label}</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {p._count}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${info.color} transition-all`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Empleados
        </h3>
        <p className="text-sm text-muted-foreground">
          <span className="text-success font-medium">
            {dashboard.statsEmpleados.ocupados} ocupados
          </span>
          <span> · </span>
          <span className="text-muted-foreground">
            {dashboard.statsEmpleados.disponibles} disponibles
          </span>
          <span> · </span>
          <span className="text-muted-foreground">
            {dashboard.statsEmpleados.total} total
          </span>
        </p>
      </div>
    </div>
  )
}
