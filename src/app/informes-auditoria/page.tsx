import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { InformeAuditoriaList } from "@/components/informes-auditoria/informe-auditoria-list"
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
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Informes de Auditoría</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestión de informes de auditoría ISO 27001</p>
      </div>

      <InformeAuditoriaList
        initialData={JSON.parse(JSON.stringify(informes))}
        initialTotal={total}
        proyectos={JSON.parse(JSON.stringify(proyectos))}
        puedeCrear={puedeCrear}
      />
    </AdminSidebar>
  )
}
