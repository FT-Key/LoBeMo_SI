import { requireGerenteGeneral } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { AuditLogList } from "@/components/audit-log/audit-log-list"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AuditoriaPage() {
  const session = await requireGerenteGeneral()

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        empleado: { select: { id: true, nombre: true, apellido: true, email: true } },
      },
    }),
    prisma.auditLog.count(),
  ])

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/auditoria">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Historial de Auditoría</h1>
          <p className="text-sm text-muted-foreground mt-1">Registro de acciones realizadas en el sistema</p>
        </div>
      </div>

      <AuditLogList
        initialData={JSON.parse(JSON.stringify(logs))}
        initialTotal={total}
      />
    </AdminSidebar>
  )
}
