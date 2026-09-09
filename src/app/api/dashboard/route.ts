import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES } from "@/lib/api-auth"
import { logger } from "@/lib/logger"

export const GET = withRole(ROLES.VIEW_DASHBOARD, async (request) => {
  try {
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
    logger.error({ err: error }, "Error fetching dashboard data")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})
