import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { KanbanProyecto } from "./kanban-proyecto"

export default async function KanbanPage() {
  const session = await requireAuth()

  const proyectos = await prisma.proyecto.findMany({
    where: { estado: { not: "CANCELADO" } },
    select: { id: true, nombre: true, estado: true },
    orderBy: { nombre: "asc" },
  })

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/kanban">
      <div className="max-w-6xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Tablero Kanban</h2>
          <p className="text-sm text-muted-foreground mt-1">Selecciona un proyecto para ver sus tareas</p>
        </div>
        <KanbanProyecto proyectos={JSON.parse(JSON.stringify(proyectos))} />
      </div>
    </AdminSidebar>
  )
}
