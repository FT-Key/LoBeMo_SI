import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { CapacitacionForm } from "@/components/capacitaciones/capacitacion-form"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function NuevaCapacitacionPage() {
  const session = await requireAuth()

  const puedeCrear = session.user.rol === "CAPACITADOR" || session.user.rol === "GERENTE_GENERAL"
  if (!puedeCrear) {
    return (
      <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/capacitaciones">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No autorizado</p>
        </div>
      </AdminSidebar>
    )
  }

  const proyectos = await prisma.proyecto.findMany({
    where: { estado: { in: ["APROBADO", "EN_EJECUCION", "EN_REVISION"] } },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  })

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/capacitaciones">
      <div className="max-w-lg">
        <div className="mb-6">
          <Link href="/capacitaciones" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Volver</Link>
          <h2 className="text-2xl font-bold mt-2">Nueva capacitación</h2>
        </div>

        <CapacitacionForm proyectos={JSON.parse(JSON.stringify(proyectos))} />
      </div>
    </AdminSidebar>
  )
}
