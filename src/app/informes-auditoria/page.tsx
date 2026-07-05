import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { InformeAuditoriaList } from "@/components/informes-auditoria/informe-auditoria-list"
import Link from "next/link"
import { NotificacionDropdown } from "@/components/notificaciones/notificacion-dropdown"

export default async function InformesAuditoriaPage() {
  const session = await requireAuth()

  const puedeCrear = session.user.rol === "AUDITOR" || session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"

  const where: Record<string, unknown> = {}
  if (session.user.rol !== "GERENTE_GENERAL" && session.user.rol !== "CISO") {
    where.creadorId = session.user.id
  }

  const [informes, total, proyectos] = await Promise.all([
    prisma.informeAuditoria.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        proyecto: { select: { id: true, nombre: true } },
        creador: { select: { id: true, nombre: true, apellido: true, rol: true } },
      },
    }),
    prisma.informeAuditoria.count({ where }),
    prisma.proyecto.findMany({
      where: { servicio: { nombre: "AUDITORIA_ISO27001" } },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
  ])

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
            <Link href="/capacitaciones" className="text-sm font-medium hover:underline">Capacitaciones</Link>
            <Link href="/pentesting" className="text-sm font-medium hover:underline">Pentesting</Link>
            <Link href="/soporte" className="text-sm font-medium hover:underline">Soporte</Link>
            <Link href="/informes-auditoria" className="text-sm font-medium text-primary hover:underline">Auditoría</Link>
            <NotificacionDropdown />
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:underline">Cerrar sesión</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Informes de Auditoría</h2>
          {puedeCrear && (
            <Link
              href="/informes-auditoria/nuevo"
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Nuevo informe
            </Link>
          )}
        </div>

        <InformeAuditoriaList
          initialData={JSON.parse(JSON.stringify(informes))}
          initialTotal={total}
          proyectos={JSON.parse(JSON.stringify(proyectos))}
        />
      </main>
    </div>
  )
}
