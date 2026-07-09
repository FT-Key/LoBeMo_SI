import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { InformeAuditoriaList } from "@/components/informes-auditoria/informe-auditoria-list"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

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

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/informes-auditoria" />

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
