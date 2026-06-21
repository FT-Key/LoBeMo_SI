import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { ServiciosList } from "./servicios-list"
import Link from "next/link"

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
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
            <Link href="/clientes" className="text-sm font-medium hover:underline">Clientes</Link>
            {esGerenteGeneral && (
              <Link href="/empleados" className="text-sm font-medium hover:underline">Empleados</Link>
            )}
            <Link href="/servicios" className="text-sm font-medium hover:underline">Servicios</Link>
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:underline">Cerrar sesión</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Servicios</h2>
        </div>

        <ServiciosList
          esGerenteGeneral={esGerenteGeneral}
          initialData={JSON.parse(JSON.stringify(servicios))}
          initialTotal={total}
        />
      </main>
    </div>
  )
}
