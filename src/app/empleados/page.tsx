import { prisma } from "@/lib/prisma"
import { requireGerenteGeneral } from "@/lib/auth-helpers"
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
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Empleados</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestión del personal de la empresa</p>
      </div>

      <EmpleadosContent
        initialData={JSON.parse(JSON.stringify(empleados))}
        initialTotal={total}
      />
    </AdminSidebar>
  )
}
