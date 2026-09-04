import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { InformeAuditoriaForm } from "@/components/informes-auditoria/informe-auditoria-form"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function NuevoInformePage() {
  const session = await requireAuth()

  const puedeCrear = session.user.rol === "AUDITOR" || session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"
  if (!puedeCrear) {
    return (
      <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/informes-auditoria">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No autorizado</p>
        </div>
      </AdminSidebar>
    )
  }

  const proyectos = await prisma.proyecto.findMany({
    where: { servicio: { nombre: "AUDITORIA_ISO27001" } },
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true },
  })

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/informes-auditoria">
      <div className="max-w-lg">
        <div className="mb-6">
          <Link href="/informes-auditoria" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Volver</Link>
          <h2 className="text-2xl font-bold mt-2">Nuevo informe de auditoría</h2>
        </div>

        <InformeAuditoriaForm proyectos={JSON.parse(JSON.stringify(proyectos))} />
      </div>
    </AdminSidebar>
  )
}
