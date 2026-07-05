import { requireGerenteGeneral } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { AuditLogList } from "@/components/audit-log/audit-log-list"
import { Navbar } from "@/components/navbar"

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
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/auditoria" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Historial de Auditoría</h2>
        </div>

        <AuditLogList
          initialData={JSON.parse(JSON.stringify(logs))}
          initialTotal={total}
        />
      </main>
    </div>
  )
}
