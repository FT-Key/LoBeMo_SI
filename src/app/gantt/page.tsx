import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { GanttProyecto } from "./gantt-proyecto"

export default async function GanttPage() {
  const session = await requireAuth()

  const proyectos = await prisma.proyecto.findMany({
    where: { estado: { not: "CANCELADO" } },
    select: { id: true, nombre: true, estado: true },
    orderBy: { nombre: "asc" },
  })

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/gantt">
      <div className="max-w-6xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Cronograma Gantt</h2>
          <p className="text-sm text-muted-foreground mt-1">Selecciona un proyecto para ver su cronograma</p>
        </div>
        <GanttProyecto proyectos={JSON.parse(JSON.stringify(proyectos))} />
      </div>
    </AdminSidebar>
  )
}
