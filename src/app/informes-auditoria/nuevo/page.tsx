import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { InformeAuditoriaForm } from "@/components/informes-auditoria/informe-auditoria-form"
import Link from "next/link"
import { NotificacionDropdown } from "@/components/notificaciones/notificacion-dropdown"

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

  const rol = session.user.rol

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
            <Link href="/proyectos" className="text-sm font-medium hover:underline">Proyectos</Link>
            <Link href="/clientes" className="text-sm font-medium hover:underline">Clientes</Link>
            {rol === "GERENTE_GENERAL" && (
              <Link href="/empleados" className="text-sm font-medium hover:underline">Empleados</Link>
            )}
            <Link href="/servicios" className="text-sm font-medium hover:underline">Servicios</Link>
            <Link href="/informes-auditoria" className="text-sm font-medium hover:underline">Auditoría</Link>
            <Link href="/calendario" className="text-sm font-medium hover:underline">Calendario</Link>
            <NotificacionDropdown />
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:underline">Cerrar sesión</Link>
          </nav>
        </div>
      </header>

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
