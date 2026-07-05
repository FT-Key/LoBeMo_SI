import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { TicketDetalle } from "@/components/soporte/ticket-detalle"
import Link from "next/link"
import { NotificacionDropdown } from "@/components/notificaciones/notificacion-dropdown"
import { notFound } from "next/navigation"

export default async function TicketDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const { id } = await params

  const puedeVer = ["SOPORTE_TECNICO", "GERENTE_GENERAL", "CISO"].includes(session.user.rol)
  if (!puedeVer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No autorizado</p>
      </div>
    )
  }

  const ticket = await prisma.ticketSoporte.findUnique({
    where: { id },
    include: {
      proyecto: { select: { id: true, nombre: true, estado: true } },
      creador: { select: { id: true, nombre: true, apellido: true, email: true } },
      asignadoA: { select: { id: true, nombre: true, apellido: true, email: true } },
    },
  })

  if (!ticket) {
    notFound()
  }

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
            <Link href="/capacitaciones" className="text-sm font-medium hover:underline">Capacitaciones</Link>
            <Link href="/pentesting" className="text-sm font-medium hover:underline">Pentesting</Link>
            <Link href="/soporte" className="text-sm font-medium hover:underline">Soporte</Link>
            <Link href="/calendario" className="text-sm font-medium hover:underline">Calendario</Link>
            <NotificacionDropdown />
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:underline">Cerrar sesión</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <TicketDetalle ticket={JSON.parse(JSON.stringify(ticket))} sessionRol={rol} />
      </main>
    </div>
  )
}
