import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { GanttChart } from "@/components/gantt/gantt-chart"

export default async function GanttProyectoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  const { id } = await params

  const proyecto = await prisma.proyecto.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      estado: true,
      fechaInicio: true,
      fechaEstimadaFin: true,
      tareas: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          titulo: true,
          estado: true,
          prioridad: true,
          createdAt: true,
          fechaLimite: true,
        },
      },
      hitos: {
        orderBy: { fechaPrevista: "asc" },
        select: { id: true, nombre: true, fechaPrevista: true, completado: true },
      },
    },
  })

  if (!proyecto) notFound()

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/proyectos">
      <div className="max-w-5xl">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Link href={`/proyectos/${id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              &larr; Volver al proyecto
            </Link>
            <span className="text-muted-foreground mx-1">|</span>
            <Link href={`/proyectos/${id}/metricas`} className="text-sm text-primary hover:underline">
              Métricas
            </Link>
          </div>
          <h2 className="text-2xl font-bold mt-2">Gantt: {proyecto.nombre}</h2>
          <p className="text-sm text-muted-foreground mt-1">Estado: {proyecto.estado.replace(/_/g, " ")}</p>
        </div>

        <div className="rounded-lg border bg-surface-elevated/80 p-6">
          <GanttChart
            tareas={JSON.parse(JSON.stringify(proyecto.tareas))}
            hitos={JSON.parse(JSON.stringify(proyecto.hitos))}
            fechaInicioProyecto={JSON.parse(JSON.stringify(proyecto.fechaInicio))}
            fechaEstimadaFin={proyecto.fechaEstimadaFin ? JSON.parse(JSON.stringify(proyecto.fechaEstimadaFin)) : null}
          />
        </div>
      </div>
    </AdminSidebar>
  )
}
