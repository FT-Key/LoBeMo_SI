import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { ServiciosList } from "./servicios-list"
import { Navbar } from "@/components/navbar"

export default async function ServiciosPage() {
  const session = await requireAuth()
  const esGerenteGeneral = session.user.rol === "GERENTE_GENERAL"

  const [servicios, total] = await Promise.all([
    prisma.servicio.findMany({
      orderBy: { nombre: "asc" },
      take: 10,
      include: { _count: { select: { proyectos: true } } },
    }),
    prisma.servicio.count(),
  ])

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/servicios" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Servicios</h2>
        </div>

        <ServiciosList
          esGerenteGeneral={esGerenteGeneral}
          initialData={JSON.parse(JSON.stringify(servicios))}
          initialTotal={total}
        />
      </main>
    </div>
  )
}
