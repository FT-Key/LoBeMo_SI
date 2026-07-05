import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { NuevoProyectoForm } from "./nuevo-proyecto-form"
import { Navbar } from "@/components/navbar"

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
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/proyectos" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/proyectos" className="text-sm text-primary hover:underline">← Volver</Link>
          <h2 className="text-2xl font-bold mt-2">Nuevo proyecto</h2>
        </div>

        <NuevoProyectoForm
          clientes={JSON.parse(JSON.stringify(clientes))}
          servicios={JSON.parse(JSON.stringify(servicios))}
        />
      </main>
    </div>
  )
}
