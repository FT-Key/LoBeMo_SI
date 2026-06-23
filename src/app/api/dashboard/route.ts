import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const ROLES_PERMITIDOS = ["GERENTE_GENERAL", "CISO", "ADMINISTRACION"]

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (!ROLES_PERMITIDOS.includes(session.user.rol)) {
      return NextResponse.json(
        { error: "No tienes permiso para ver el dashboard" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const desdeParam = searchParams.get("desde")
    const hastaParam = searchParams.get("hasta")

    const desde = desdeParam ? new Date(desdeParam) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const hasta = hastaParam ? new Date(hastaParam) : new Date()

    if (hasta < desde) {
      return NextResponse.json(
        { error: "La fecha 'hasta' debe ser posterior a 'desde'" },
        { status: 400 }
      )
    }

    const proyectosPorEstado = await prisma.proyecto.groupBy({
      by: ["estado"],
      _count: true,
    })

    const [empleadosOcupados, empleadosDisponibles, totalEmpleados] =
      await Promise.all([
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
      ])

    const ingresosMes = await prisma.proyecto.aggregate({
      where: {
        estado: { in: ["APROBADO", "EN_EJECUCION", "EN_REVISION", "ENTREGADO"] },
        fechaInicio: { gte: desde, lte: hasta },
        montoAcordado: { not: null },
      },
      _sum: { montoAcordado: true },
    })

    const clientesNuevos = await prisma.cliente.count({
      where: {
        fechaRegistro: { gte: desde, lte: hasta },
      },
    })

    const statsEmpleados = {
      ocupados: empleadosOcupados,
      disponibles: empleadosDisponibles,
      total: totalEmpleados,
    }

    return NextResponse.json({
      data: {
        proyectosPorEstado,
        statsEmpleados,
        ingresosDelMes: ingresosMes._sum.montoAcordado ?? 0,
        clientesNuevos,
        periodo: {
          desde: desde.toISOString(),
          hasta: hasta.toISOString(),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
