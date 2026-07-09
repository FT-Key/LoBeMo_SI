import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { TicketList } from "@/components/soporte/ticket-list"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

export default async function SoportePage() {
  const session = await requireAuth()

  const puedeVer = ["SOPORTE_TECNICO", "GERENTE_GENERAL", "CISO"].includes(session.user.rol)
  if (!puedeVer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No autorizado</p>
      </div>
    )
  }

  const [tickets, total] = await Promise.all([
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
  ])

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/soporte" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Tickets de soporte técnico</h2>
          <Link
            href="/soporte/nuevo"
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Nuevo ticket
          </Link>
        </div>

        <TicketList initialData={JSON.parse(JSON.stringify(tickets))} initialTotal={total} />
      </main>
    </div>
  )
}
