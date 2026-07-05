import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { TicketForm } from "@/components/soporte/ticket-form"
import Link from "next/link"
import { NotificacionDropdown } from "@/components/notificaciones/notificacion-dropdown"

export default async function NuevoTicketPage() {
  const session = await requireAuth()

  const puedeCrear = ["SOPORTE_TECNICO", "GERENTE_GENERAL", "CISO"].includes(session.user.rol)
  if (!puedeCrear) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No autorizado</p>
      </div>
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

  const rol = session.user.rol

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
            <Link href="/proyectos" className="text-sm font-medium hover:underline">Proyectos</Link>
            <Link href="/clientes" className="text-sm font-medium hover:underline">Clientes</Link>
            {rol === "GERENTE_GENERAL" && (
              <Link href="/empleados" className="text-sm font-medium hover:underline">Empleados</Link>
            )}
            <Link href="/servicios" className="text-sm font-medium hover:underline">Servicios</Link>
            <Link href="/informes-auditoria" className="text-sm font-medium hover:underline">Auditoría</Link>
            <Link href="/capacitaciones" className="text-sm font-medium hover:underline">Capacitaciones</Link>
            <Link href="/pentesting" className="text-sm font-medium hover:underline">Pentesting</Link>
            <Link href="/soporte" className="text-sm font-medium hover:underline">Soporte</Link>
            <NotificacionDropdown />
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:underline">Cerrar sesión</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/soporte" className="text-sm text-primary hover:underline">← Volver</Link>
          <h2 className="text-2xl font-bold mt-2">Nuevo ticket de soporte</h2>
        </div>

        <TicketForm
          empleados={JSON.parse(JSON.stringify(empleados))}
          proyectos={JSON.parse(JSON.stringify(proyectos))}
        />
      </main>
    </div>
  )
}
