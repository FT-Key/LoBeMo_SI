import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { MiDashboardContent } from "./mi-dashboard-content"

export default async function MiDashboardPage() {
  const session = await requireAuth()

  const empleadoId = session.user.id

  const [asignaciones, tareasAsignadas, tareasPorEstado, tareasPorPrioridad] = await Promise.all([
    prisma.asignacion.findMany({
      where: { empleadoId },
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            estado: true,
            fechaEstimadaFin: true,
            cliente: { select: { razonSocial: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tarea.findMany({
      where: { asignacion: { empleadoId } },
      include: {
        proyecto: { select: { id: true, nombre: true, codigo: true } },
      },
      orderBy: [{ estado: "asc" }, { prioridad: "desc" }, { fechaLimite: "asc" }],
    }),
    prisma.tarea.groupBy({
      by: ["estado"],
      where: { asignacion: { empleadoId } },
      _count: true,
    }),
    prisma.tarea.groupBy({
      by: ["prioridad"],
      where: { asignacion: { empleadoId } },
      _count: true,
    }),
  ])

  const tareasPendientes = tareasAsignadas.filter((t) => t.estado !== "COMPLETADA")
  const tareasCompletadas = tareasAsignadas.filter((t) => t.estado === "COMPLETADA")

  const proyectosActivos = asignaciones
    .map((a) => a.proyecto)
    .filter((p) => !["CERRADO"].includes(p.estado))

  const initialData = {
    resumen: {
      proyectosActivos: asignaciones.length,
      totalTareas: tareasAsignadas.length,
      tareasPendientes: tareasPendientes.length,
      tareasCompletadas: tareasCompletadas.length,
    },
    proyectos: JSON.parse(JSON.stringify(proyectosActivos)),
    tareas: JSON.parse(JSON.stringify(tareasAsignadas.slice(0, 20))),
    tareasPorEstado,
    tareasPorPrioridad,
  }

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/mi-dashboard">
      <div className="max-w-5xl">
        <MiDashboardContent initialData={initialData} />
      </div>
    </AdminSidebar>
  )
}
