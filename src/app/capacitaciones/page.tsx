import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { CapacitacionList } from "@/components/capacitaciones/capacitacion-list"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

export default async function CapacitacionesPage() {
  const session = await requireAuth()

  const puedeCrear = session.user.rol === "CAPACITADOR" || session.user.rol === "GERENTE_GENERAL"
  const puedeVer = puedeCrear || session.user.rol === "CISO"

  if (!puedeVer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No autorizado</p>
      </div>
    )
  }

  const [capacitaciones, total] = await Promise.all([
    prisma.capacitacion.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        proyecto: { select: { id: true, nombre: true } },
        _count: { select: { asistentes: true } },
      },
    }),
    prisma.capacitacion.count(),
  ])

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/capacitaciones" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Capacitaciones</h2>
          {puedeCrear && (
            <Link
              href="/capacitaciones/nuevo"
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Nueva capacitación
            </Link>
          )}
        </div>

        <CapacitacionList
          initialData={JSON.parse(JSON.stringify(capacitaciones))}
          initialTotal={total}
        />
      </main>
    </div>
  )
}
