"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  FolderOpen,
  Users,
  DollarSign,
  UserPlus,
  TrendingUp,
  BarChart3,
} from "lucide-react"

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

  const statsCards = [
    {
      title: "Proyectos Activos",
      value: dashboard.proyectosPorEstado
        .filter((p) => !["CERRADO", "ENTREGADO"].includes(p.estado))
        .reduce((sum, p) => sum + p._count, 0),
      icon: <FolderOpen className="size-5" />,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Empleados Ocupados",
      value: dashboard.statsEmpleados.ocupados,
      subtitle: `/ ${dashboard.statsEmpleados.total}`,
      icon: <Users className="size-5" />,
      color: "text-warning",
      bgColor: "bg-warning/10",
      progress: dashboard.statsEmpleados.total > 0
        ? (dashboard.statsEmpleados.ocupados / dashboard.statsEmpleados.total) * 100
        : 0,
    },
    {
      title: "Ingresos del Mes",
      value: formatearMonto(Number(dashboard.ingresosDelMes)),
      icon: <DollarSign className="size-5" />,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Clientes Nuevos",
      value: dashboard.clientesNuevos,
      icon: <UserPlus className="size-5" />,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Resumen general del sistema</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border">
            <label className="text-xs text-muted-foreground">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="bg-transparent text-sm text-foreground border-0 outline-none w-[130px]"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border">
            <label className="text-xs text-muted-foreground">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="bg-transparent text-sm text-foreground border-0 outline-none w-[130px]"
            />
          </div>
          {isFetching && (
            <span className="text-xs text-muted-foreground animate-pulse flex items-center gap-1">
              <TrendingUp className="size-3" /> Actualizando...
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => (
          <div
            key={card.title}
            className="group relative rounded-2xl border border-border bg-surface/50 backdrop-blur-sm p-5 hover:bg-surface/80 transition-all duration-200 hover:shadow-lg hover:shadow-black/10"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-bold ${card.color}`}>{card.value}</span>
                  {card.subtitle && (
                    <span className="text-base text-muted-foreground font-medium">{card.subtitle}</span>
                  )}
                </div>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color} transition-transform group-hover:scale-110`}>
                {card.icon}
              </div>
            </div>
            {card.progress !== undefined && (
              <div className="mt-3">
                <div className="h-1.5 w-full rounded-full bg-muted/50">
                  <div
                    className="h-1.5 rounded-full bg-warning transition-all duration-500"
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Projects by Status */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="size-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Proyectos por Estado</h3>
          </div>
          <div className="space-y-3.5">
            {dashboard.proyectosPorEstado.length === 0 && (
              <p className="text-sm text-muted-foreground">No hay proyectos registrados</p>
            )}
            {dashboard.proyectosPorEstado.map((p) => {
              const info = MAPA_ESTADOS[p.estado] ?? { label: p.estado, color: "bg-muted-foreground" }
              const porcentaje = (p._count / maxProyectos) * 100
              return (
                <div key={p.estado}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${info.color}`} />
                      <span className="text-foreground font-medium">{info.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground tabular-nums">{p._count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/30">
                    <div
                      className={`h-2 rounded-full ${info.color} transition-all duration-500`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Employees Summary */}
        <div className="rounded-2xl border border-border bg-surface/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users className="size-5 text-success" />
            <h3 className="text-lg font-semibold text-foreground">Empleados</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-success/10">
              <span className="text-sm font-medium text-success">Ocupados</span>
              <span className="text-lg font-bold text-success">{dashboard.statsEmpleados.ocupados}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <span className="text-sm font-medium text-muted-foreground">Disponibles</span>
              <span className="text-lg font-bold text-foreground">{dashboard.statsEmpleados.disponibles}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-lg font-bold text-foreground">{dashboard.statsEmpleados.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
