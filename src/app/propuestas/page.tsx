import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { PropuestasList } from "./propuestas-list"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

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
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/propuestas">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Propuestas</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión de propuestas comerciales</p>
        </div>
        {puedeCrear && (
          <Link
            href="/propuestas/nuevo"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
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
    </AdminSidebar>
  )
}
