import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { ClientesList } from "./clientes-list"
import Link from "next/link"
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión de clientes de la empresa</p>
        </div>
        {puedeEditar && (
          <Link
            href="/clientes/nuevo"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
          >
            Nuevo cliente
          </Link>
        )}
      </div>

      <ClientesList
        puedeEditar={puedeEditar}
        initialData={JSON.parse(JSON.stringify(clientes))}
        initialTotal={total}
      />
    </AdminSidebar>
  )
}
