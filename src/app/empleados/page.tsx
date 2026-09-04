import { prisma } from "@/lib/prisma"
import { requireGerenteGeneral } from "@/lib/auth-helpers"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { EmpleadosContent } from "./empleados-content"

export default async function EmpleadosPage() {
  const session = await requireGerenteGeneral()

  const [empleados, total] = await Promise.all([
    prisma.empleado.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        area: true,
        activo: true,
      },
    }),
    prisma.empleado.count(),
  ])

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/empleados">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Empleados</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión del personal de la empresa</p>
        </div>
        <Link
          href="/empleados/nuevo"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
        >
          Nuevo empleado
        </Link>
      </div>

      <EmpleadosContent
        initialData={JSON.parse(JSON.stringify(empleados))}
        initialTotal={total}
      />
    </AdminSidebar>
  )
}
