import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardContent } from "./dashboard-content"
import { Navbar } from "@/components/navbar"

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

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/dashboard" />

      <main className="container mx-auto px-4 py-8">
        <DashboardContent initialData={initialData} />
      </main>
    </div>
  )
}
