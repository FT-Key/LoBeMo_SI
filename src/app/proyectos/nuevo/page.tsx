import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { NuevoProyectoForm } from "./nuevo-proyecto-form"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

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
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/proyectos">
      <div className="max-w-lg">
        <div className="mb-6">
          <Link href="/proyectos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Volver</Link>
          <h2 className="text-2xl font-bold mt-2">Nuevo proyecto</h2>
        </div>

        <NuevoProyectoForm
          clientes={JSON.parse(JSON.stringify(clientes))}
          servicios={JSON.parse(JSON.stringify(servicios))}
        />
      </div>
    </AdminSidebar>
  )
}
