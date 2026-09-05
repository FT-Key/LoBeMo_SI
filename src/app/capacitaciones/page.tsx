import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { CapacitacionList } from "@/components/capacitaciones/capacitacion-list"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function CapacitacionesPage() {
  const session = await requireAuth()

  const puedeCrear = session.user.rol === "CAPACITADOR" || session.user.rol === "GERENTE_GENERAL"
  const puedeVer = puedeCrear || session.user.rol === "CISO"

  if (!puedeVer) {
    return (
      <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/capacitaciones">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No autorizado</p>
        </div>
      </AdminSidebar>
    )
  }

  const [capacitaciones, total, proyectos] = await Promise.all([
    prisma.capacitacion.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        proyecto: { select: { id: true, nombre: true } },
        _count: { select: { asistentes: true } },
      },
    }),
    prisma.capacitacion.count(),
    prisma.proyecto.findMany({
      where: { estado: { in: ["APROBADO", "EN_EJECUCION", "EN_REVISION"] } },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
  ])

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/capacitaciones">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Capacitaciones</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestión de capacitaciones y entrenamientos</p>
      </div>

      <CapacitacionList
        initialData={JSON.parse(JSON.stringify(capacitaciones))}
        initialTotal={total}
        proyectos={JSON.parse(JSON.stringify(proyectos))}
        puedeCrear={puedeCrear}
      />
    </AdminSidebar>
  )
}
