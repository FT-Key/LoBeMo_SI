import { requireGerenteGeneral } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { AuditLogList } from "@/components/audit-log/audit-log-list"
import Link from "next/link"
import { NotificacionDropdown } from "@/components/notificaciones/notificacion-dropdown"

export default async function AuditoriaPage() {
  const session = await requireGerenteGeneral()

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        empleado: { select: { id: true, nombre: true, apellido: true, email: true } },
      },
    }),
    prisma.auditLog.count(),
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
            <Link href="/empleados" className="text-sm font-medium hover:underline">Empleados</Link>
            <Link href="/servicios" className="text-sm font-medium hover:underline">Servicios</Link>
            <Link href="/informes-auditoria" className="text-sm font-medium hover:underline">Auditoría</Link>
            <Link href="/capacitaciones" className="text-sm font-medium hover:underline">Capacitaciones</Link>
            <Link href="/pentesting" className="text-sm font-medium hover:underline">Pentesting</Link>
            <Link href="/auditoria" className="text-sm font-medium text-primary hover:underline">Audit Log</Link>
            <NotificacionDropdown />
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:underline">Cerrar sesión</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Historial de Auditoría</h2>
        </div>

        <AuditLogList
          initialData={JSON.parse(JSON.stringify(logs))}
          initialTotal={total}
        />
      </main>
    </div>
  )
}
