import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { ClientesList } from "./clientes-list"
import Link from "next/link"

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
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
            <Link href="/proyectos" className="text-sm font-medium hover:underline">Proyectos</Link>
            {puedeEditar && (
              <Link href="/empleados" className="text-sm font-medium hover:underline">Empleados</Link>
            )}
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:underline">Cerrar sesión</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Clientes</h2>
          {puedeEditar && (
            <Link
              href="/clientes/nuevo"
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
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
      </main>
    </div>
  )
}
