import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { NuevoProyectoForm } from "./nuevo-proyecto-form"

export default async function NuevoProyectoPage() {
  const session = await requireAuth()

  if (session.user.rol !== "GERENTE_GENERAL" && session.user.rol !== "CISO") {
    redirect("/proyectos")
  }

  const [clientes, servicios] = await Promise.all([
    prisma.cliente.findMany({
      where: { activo: true },
      orderBy: { razonSocial: "asc" },
      select: { id: true, razonSocial: true },
    }),
    prisma.servicio.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
  ])

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
            <Link href="/proyectos" className="text-sm font-medium hover:underline">Proyectos</Link>
            <Link href="/clientes" className="text-sm font-medium hover:underline">Clientes</Link>
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:underline">Cerrar sesión</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/proyectos" className="text-sm text-muted-foreground hover:underline">&larr; Volver a proyectos</Link>
        </div>
        <h2 className="text-2xl font-bold mb-6">Nuevo proyecto</h2>

        <NuevoProyectoForm
          clientes={JSON.parse(JSON.stringify(clientes))}
          servicios={JSON.parse(JSON.stringify(servicios))}
        />
      </main>
    </div>
  )
}
