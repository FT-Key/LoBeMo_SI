import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { TicketForm } from "@/components/soporte/ticket-form"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function NuevoTicketPage() {
  const session = await requireAuth()

  const puedeCrear = ["SOPORTE_TECNICO", "GERENTE_GENERAL", "CISO"].includes(session.user.rol)
  if (!puedeCrear) {
    return (
      <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/soporte">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No autorizado</p>
        </div>
      </AdminSidebar>
    )
  }

  const [empleados, proyectos] = await Promise.all([
    prisma.empleado.findMany({
      where: {
        activo: true,
        rol: { in: ["SOPORTE_TECNICO", "CISO", "GERENTE_GENERAL", "ANALISTA_SEGURIDAD", "DESARROLLADOR", "ESPECIALISTA_REDES"] },
      },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, apellido: true },
    }),
    prisma.proyecto.findMany({
      where: { estado: { in: ["APROBADO", "EN_EJECUCION", "EN_REVISION"] } },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
  ])

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/soporte">
      <div className="max-w-lg">
        <div className="mb-6">
          <Link href="/soporte" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Volver</Link>
          <h2 className="text-2xl font-bold mt-2">Nuevo ticket de soporte</h2>
        </div>

        <TicketForm
          empleados={JSON.parse(JSON.stringify(empleados))}
          proyectos={JSON.parse(JSON.stringify(proyectos))}
        />
      </div>
    </AdminSidebar>
  )
}
