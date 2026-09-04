import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { TicketList } from "@/components/soporte/ticket-list"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function SoportePage() {
  const session = await requireAuth()

  const puedeVer = ["SOPORTE_TECNICO", "GERENTE_GENERAL", "CISO"].includes(session.user.rol)
  if (!puedeVer) {
    return (
      <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/soporte">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No autorizado</p>
        </div>
      </AdminSidebar>
    )
  }

  const [tickets, total, proyectos] = await Promise.all([
    prisma.ticketSoporte.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        proyecto: { select: { id: true, nombre: true } },
        creador: { select: { id: true, nombre: true, apellido: true } },
        asignadoA: { select: { id: true, nombre: true, apellido: true } },
      },
    }),
    prisma.ticketSoporte.count(),
    prisma.proyecto.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
  ])

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/soporte">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Tickets de Soporte</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión de tickets de soporte técnico</p>
        </div>
        <Link
          href="/soporte/nuevo"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
        >
          Nuevo ticket
        </Link>
      </div>

      <TicketList
        initialData={JSON.parse(JSON.stringify(tickets))}
        initialTotal={total}
        proyectos={JSON.parse(JSON.stringify(proyectos))}
      />
    </AdminSidebar>
  )
}
