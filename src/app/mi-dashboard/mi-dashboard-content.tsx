"use client"

import Link from "next/link"
import {
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  BarChart3,
} from "lucide-react"

const ESTADO_LABELS: Record<string, string> = {
  RELEVAMIENTO: "Relevamiento",
  PROPUESTA: "Propuesta",
  APROBADO: "Aprobado",
  EN_EJECUCION: "En Ejecución",
  EN_REVISION: "En Revisión",
  ENTREGADO: "Entregado",
  CERRADO: "Cerrado",
}

const ESTADO_COLORS: Record<string, string> = {
  RELEVAMIENTO: "bg-info/15 text-info",
  PROPUESTA: "bg-warning/15 text-warning",
  APROBADO: "bg-primary/15 text-primary",
  EN_EJECUCION: "bg-success/15 text-success",
  EN_REVISION: "bg-accent/15 text-accent",
  ENTREGADO: "bg-info/15 text-info",
  CERRADO: "bg-muted-foreground/15 text-muted-foreground",
}

const TAREA_ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROGRESO: "En Progreso",
  COMPLETADA: "Completada",
  BLOQUEADA: "Bloqueada",
}

const TAREA_ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: "bg-muted text-muted-foreground",
  EN_PROGRESO: "bg-info/15 text-info",
  COMPLETADA: "bg-success/15 text-success",
  BLOQUEADA: "bg-destructive/15 text-destructive",
}

const PRIORIDAD_COLORS: Record<string, string> = {
  ALTA: "text-destructive",
  MEDIA: "text-warning",
  BAJA: "text-muted-foreground",
}

type Proyecto = {
  id: string
  nombre: string
  codigo: string
  estado: string
  fechaEstimadaFin: string | null
  cliente: { razonSocial: string }
}

type Tarea = {
  id: string
  titulo: string
  estado: string
  prioridad: string
  fechaLimite: string | null
  proyecto: { id: string; nombre: string; codigo: string } | null
}

type DashboardData = {
  resumen: {
    proyectosActivos: number
    totalTareas: number
    tareasPendientes: number
    tareasCompletadas: number
  }
  proyectos: Proyecto[]
  tareas: Tarea[]
  tareasPorEstado: { estado: string; _count: number }[]
  tareasPorPrioridad: { prioridad: string; _count: number }[]
}

export function MiDashboardContent({ initialData }: { initialData: DashboardData }) {
  const { resumen, proyectos, tareas, tareasPorEstado, tareasPorPrioridad } = initialData

  const statsCards = [
    {
      title: "Mis Proyectos",
      value: resumen.proyectosActivos,
      icon: <FolderOpen className="size-5" />,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Tareas Pendientes",
      value: resumen.tareasPendientes,
      icon: <Clock className="size-5" />,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Tareas Completadas",
      value: resumen.tareasCompletadas,
      icon: <CheckCircle2 className="size-5" />,
      color: "text-success",
      bgColor: "bg-success/10",
      progress: resumen.totalTareas > 0
        ? (resumen.tareasCompletadas / resumen.totalTareas) * 100
        : 0,
    },
    {
      title: "Total Tareas",
      value: resumen.totalTareas,
      icon: <ListTodo className="size-5" />,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ]

  const maxTareasEstado = Math.max(1, ...tareasPorEstado.map((t) => t._count))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Mi Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen personal de actividades</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border bg-surface-elevated/80 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{card.title}</span>
              <div className={`${card.bgColor} ${card.color} rounded-lg p-2`}>
                {card.icon}
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-foreground">{card.value}</span>
              {"progress" in card && card.progress !== undefined && (
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-success transition-all"
                    style={{ width: `${Math.min(card.progress, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-surface-elevated/80 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Tareas por Estado</h2>
          </div>
          <div className="space-y-3">
            {tareasPorEstado.map((item) => (
              <div key={item.estado} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 truncate">
                  {TAREA_ESTADO_LABELS[item.estado] ?? item.estado}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(item._count / maxTareasEstado) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-6 text-right">
                  {item._count}
                </span>
              </div>
            ))}
            {tareasPorEstado.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin tareas asignadas</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-surface-elevated/80 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Tareas por Prioridad</h2>
          </div>
          <div className="space-y-3">
            {tareasPorPrioridad.map((item) => (
              <div key={item.prioridad} className="flex items-center gap-3">
                <span className={`text-xs font-medium w-24 ${PRIORIDAD_COLORS[item.prioridad] ?? "text-muted-foreground"}`}>
                  {item.prioridad}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(item._count / maxTareasEstado) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-6 text-right">
                  {item._count}
                </span>
              </div>
            ))}
            {tareasPorPrioridad.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin tareas asignadas</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-surface-elevated/80 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Mis Proyectos</h2>
          </div>
          <Link href="/proyectos" className="text-xs text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {proyectos.map((p) => (
            <Link
              key={p.id}
              href={`/proyectos/${p.id}`}
              className="block rounded-lg border border-border/50 bg-muted/30 p-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-muted-foreground">{p.codigo}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${ESTADO_COLORS[p.estado] ?? "bg-muted text-muted-foreground"}`}>
                  {ESTADO_LABELS[p.estado] ?? p.estado}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground mt-1 truncate">{p.nombre}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.cliente.razonSocial}</p>
            </Link>
          ))}
          {proyectos.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full">Sin proyectos asignados</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-surface-elevated/80 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListTodo className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Mis Tareas</h2>
          </div>
          <Link href="/tareas" className="text-xs text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="space-y-2">
          {tareas.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
            >
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${TAREA_ESTADO_COLORS[t.estado] ?? "bg-muted text-muted-foreground"}`}>
                {TAREA_ESTADO_LABELS[t.estado] ?? t.estado}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{t.titulo}</p>
                {t.proyecto && (
                  <p className="text-xs text-muted-foreground truncate">
                    {t.proyecto.codigo} — {t.proyecto.nombre}
                  </p>
                )}
              </div>
              <span className={`text-xs font-medium shrink-0 ${PRIORIDAD_COLORS[t.prioridad] ?? "text-muted-foreground"}`}>
                {t.prioridad}
              </span>
              {t.fechaLimite && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(t.fechaLimite).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
                </span>
              )}
            </div>
          ))}
          {tareas.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin tareas asignadas</p>
          )}
        </div>
      </div>
    </div>
  )
}
