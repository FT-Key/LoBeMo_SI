import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { ClientesList } from "./clientes-list"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function ClientesPage() {
  const session = await requireAuth()
  const puedeEditar = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "ADMINISTRACION" || session.user.rol === "VENTAS"

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { _count: { select: { proyectos: true } } },
    }),
    prisma.cliente.count(),
  ])

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/clientes">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestión de clientes de la empresa</p>
      </div>

      <ClientesList
        puedeEditar={puedeEditar}
        initialData={JSON.parse(JSON.stringify(clientes))}
        initialTotal={total}
      />
    </AdminSidebar>
  )
}
