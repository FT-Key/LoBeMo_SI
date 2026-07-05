import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardContent } from "./dashboard-content"
import { NotificacionDropdown } from "@/components/notificaciones/notificacion-dropdown"

const ROLES_PERMITIDOS = ["GERENTE_GENERAL", "CISO", "ADMINISTRACION"]

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  if (!ROLES_PERMITIDOS.includes(session.user.rol)) {
    redirect("/proyectos")
  }

  const ahora = new Date()
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

  const [proyectosPorEstado, empleadosOcupados, empleadosDisponibles, totalEmpleados, ingresosMes, clientesNuevos] =
    await Promise.all([
      prisma.proyecto.groupBy({
        by: ["estado"],
        _count: true,
      }),
      prisma.empleado.count({
        where: {
          activo: true,
          asignaciones: {
            some: {
              proyecto: {
                estado: { in: ["EN_EJECUCION", "EN_REVISION"] },
              },
            },
          },
        },
      }),
      prisma.empleado.count({
        where: {
          activo: true,
          asignaciones: {
            none: {
              proyecto: {
                estado: { in: ["EN_EJECUCION", "EN_REVISION"] },
              },
            },
          },
        },
      }),
      prisma.empleado.count({ where: { activo: true } }),
      prisma.proyecto.aggregate({
        where: {
          estado: { in: ["APROBADO", "EN_EJECUCION", "EN_REVISION", "ENTREGADO"] },
          fechaInicio: { gte: inicioMes, lte: ahora },
          montoAcordado: { not: null },
        },
        _sum: { montoAcordado: true },
      }),
      prisma.cliente.count({
        where: {
          fechaRegistro: { gte: inicioMes, lte: ahora },
        },
      }),
    ])

  const initialData = {
    proyectosPorEstado,
    statsEmpleados: {
      ocupados: empleadosOcupados,
      disponibles: empleadosDisponibles,
      total: totalEmpleados,
    },
    ingresosDelMes: Number(ingresosMes._sum.montoAcordado ?? 0),
    clientesNuevos,
    periodo: {
      desde: inicioMes.toISOString(),
      hasta: ahora.toISOString(),
    },
  }

  const rol = session.user.rol

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">LoBeMo</h1>
          <nav className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm font-medium text-primary hover:underline">
              Dashboard
            </a>
            <a href="/proyectos" className="text-sm font-medium text-foreground hover:underline">
              Proyectos
            </a>
            <a href="/clientes" className="text-sm font-medium text-foreground hover:underline">
              Clientes
            </a>
            {rol === "GERENTE_GENERAL" && (
              <a href="/empleados" className="text-sm font-medium text-foreground hover:underline">
                Empleados
              </a>
            )}
            <a href="/servicios" className="text-sm font-medium text-foreground hover:underline">
              Servicios
            </a>
            <a href="/capacitaciones" className="text-sm font-medium text-foreground hover:underline">
              Capacitaciones
            </a>
            <a href="/pentesting" className="text-sm font-medium text-foreground hover:underline">
              Pentesting
            </a>
            <a href="/soporte" className="text-sm font-medium text-foreground hover:underline">
              Soporte
            </a>
            {(rol === "AUDITOR" || rol === "GERENTE_GENERAL" || rol === "CISO") && (
              <a href="/informes-auditoria" className="text-sm font-medium text-foreground hover:underline">
                Auditoría
              </a>
            )}
            <NotificacionDropdown />
            <span className="text-sm text-muted-foreground">
              {session.user.name}
            </span>
            <a
              href="/api/auth/signout"
              className="text-sm text-muted-foreground hover:underline"
            >
              Cerrar sesión
            </a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <DashboardContent initialData={initialData} />
      </main>
    </div>
  )
}
