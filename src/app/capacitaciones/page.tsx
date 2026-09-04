import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { CapacitacionList } from "@/components/capacitaciones/capacitacion-list"
import Link from "next/link"
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

  const [capacitaciones, total] = await Promise.all([
    prisma.capacitacion.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        proyecto: { select: { id: true, nombre: true } },
        _count: { select: { asistentes: true } },
      },
    }),
    prisma.capacitacion.count(),
  ])

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/capacitaciones">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Capacitaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión de capacitaciones y entrenamientos</p>
        </div>
        {puedeCrear && (
          <Link
            href="/capacitaciones/nuevo"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
          >
            Nueva capacitación
          </Link>
        )}
      </div>

      <CapacitacionList
        initialData={JSON.parse(JSON.stringify(capacitaciones))}
        initialTotal={total}
      />
    </AdminSidebar>
  )
}
