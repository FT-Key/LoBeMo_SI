import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { InformeAuditoriaList } from "@/components/informes-auditoria/informe-auditoria-list"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

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
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/informes-auditoria">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Informes de Auditoría</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión de informes de auditoría ISO 27001</p>
        </div>
        {puedeCrear && (
          <Link
            href="/informes-auditoria/nuevo"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
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
    </AdminSidebar>
  )
}
