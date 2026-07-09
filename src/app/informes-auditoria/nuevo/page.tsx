import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { InformeAuditoriaForm } from "@/components/informes-auditoria/informe-auditoria-form"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

export default async function NuevoInformePage() {
  const session = await requireAuth()

  const puedeCrear = session.user.rol === "AUDITOR" || session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"
  if (!puedeCrear) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No autorizado</p>
      </div>
    )
  }

  const proyectos = await prisma.proyecto.findMany({
    where: { servicio: { nombre: "AUDITORIA_ISO27001" } },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  })

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/informes-auditoria" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/informes-auditoria" className="text-sm text-primary hover:underline">← Volver</Link>
          <h2 className="text-2xl font-bold mt-2">Nuevo informe de auditoría</h2>
        </div>

        <InformeAuditoriaForm proyectos={JSON.parse(JSON.stringify(proyectos))} />
      </main>
    </div>
  )
}
