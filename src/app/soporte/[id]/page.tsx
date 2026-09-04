import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { TicketDetalle } from "@/components/soporte/ticket-detalle"
import { notFound } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

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
      <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/soporte">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No autorizado</p>
        </div>
      </AdminSidebar>
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

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/soporte">
      <TicketDetalle ticket={JSON.parse(JSON.stringify(ticket))} sessionRol={session.user.rol} />
    </AdminSidebar>
  )
}
