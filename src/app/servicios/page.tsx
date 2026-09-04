import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { ServiciosList } from "./servicios-list"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function ServiciosPage() {
  const session = await requireAuth()
  const esGerenteGeneral = session.user.rol === "GERENTE_GENERAL"

  const [servicios, total] = await Promise.all([
    prisma.servicio.findMany({
      orderBy: { nombre: "asc" },
      take: 10,
      include: { _count: { select: { proyectos: true } } },
    }),
    prisma.servicio.count(),
  ])

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/servicios">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Servicios</h1>
          <p className="text-sm text-muted-foreground mt-1">Catálogo de servicios de la empresa</p>
        </div>
      </div>

      <ServiciosList
        esGerenteGeneral={esGerenteGeneral}
        initialData={JSON.parse(JSON.stringify(servicios))}
        initialTotal={total}
      />
    </AdminSidebar>
  )
}
