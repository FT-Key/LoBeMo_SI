import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { CapacitacionForm } from "@/components/capacitaciones/capacitacion-form"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

export default async function NuevaCapacitacionPage() {
  const session = await requireAuth()

  const puedeCrear = session.user.rol === "CAPACITADOR" || session.user.rol === "GERENTE_GENERAL"
  if (!puedeCrear) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No autorizado</p>
      </div>
    )
  }

  const proyectos = await prisma.proyecto.findMany({
    where: { estado: { in: ["APROBADO", "EN_EJECUCION", "EN_REVISION"] } },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  })

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/capacitaciones" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/capacitaciones" className="text-sm text-primary hover:underline">← Volver</Link>
          <h2 className="text-2xl font-bold mt-2">Nueva capacitación</h2>
        </div>

        <CapacitacionForm proyectos={JSON.parse(JSON.stringify(proyectos))} />
      </main>
    </div>
  )
}
