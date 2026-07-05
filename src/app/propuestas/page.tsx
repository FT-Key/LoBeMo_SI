import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { PropuestasList } from "./propuestas-list"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

const ESTADO_PROPUESTA_LABELS: Record<string, string> = {
  ENVIADA: "Enviada",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
  RECOTIZADA: "Recotizada",
}

export default async function PropuestasPage() {
  const session = await requireAuth()
  const puedeCrear = ["GERENTE_GENERAL", "ADMINISTRACION", "VENTAS"].includes(session.user.rol)

  const [propuestas, total] = await Promise.all([
    prisma.propuesta.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        proyecto: {
          select: {
            id: true,
            nombre: true,
            estado: true,
            cliente: { select: { razonSocial: true } },
          },
        },
      },
    }),
    prisma.propuesta.count(),
  ])

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/propuestas" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Propuestas</h2>
          {puedeCrear && (
            <Link
              href="/propuestas/nuevo"
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Nueva propuesta
            </Link>
          )}
        </div>

        <PropuestasList
          initialData={JSON.parse(JSON.stringify(propuestas))}
          initialTotal={total}
          estadoLabels={ESTADO_PROPUESTA_LABELS}
        />
      </main>
    </div>
  )
}
