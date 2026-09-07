import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES } from "@/lib/api-auth"
import ExcelJS from "exceljs"

const ESTADO_LABELS: Record<string, string> = {
  RELEVAMIENTO: "Relevamiento",
  PROPUESTA: "Propuesta",
  APROBADO: "Aprobado",
  EN_EJECUCION: "En Ejecución",
  EN_REVISION: "En Revisión",
  ENTREGADO: "Entregado",
  CERRADO: "Cerrado",
}

export const GET = withRole(ROLES.VIEW_DASHBOARD, async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const formato = searchParams.get("formato") === "csv" ? "csv" : "xlsx"
    const desdeParam = searchParams.get("desde")
    const hastaParam = searchParams.get("hasta")

    const desde = desdeParam ? new Date(desdeParam) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const hasta = hastaParam ? new Date(hastaParam) : new Date()

    const proyectosPorEstado = await prisma.proyecto.groupBy({
      by: ["estado"],
      _count: true,
    })

    const [empleadosOcupados, empleadosDisponibles, totalEmpleados] = await Promise.all([
      prisma.empleado.count({
        where: {
          activo: true,
          asignaciones: { some: { proyecto: { estado: { in: ["EN_EJECUCION", "EN_REVISION"] } } } },
        },
      }),
      prisma.empleado.count({
        where: {
          activo: true,
          asignaciones: { none: { proyecto: { estado: { in: ["EN_EJECUCION", "EN_REVISION"] } } } },
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
      where: { fechaRegistro: { gte: desde, lte: hasta } },
    })

    const proyectosActivos = proyectosPorEstado
      .filter((p) => !["CERRADO", "ENTREGADO"].includes(p.estado))
      .reduce((sum, p) => sum + p._count, 0)

    if (formato === "csv") {
      const lines = [
        "LoBeMo Seguridad Informatica - Reporte del Dashboard",
        `Periodo: ${desde.toLocaleDateString("es-AR")} - ${hasta.toLocaleDateString("es-AR")}`,
        "",
        "Metrica,Valor",
        `Proyectos Activos,${proyectosActivos}`,
        `Empleados Ocupados,${empleadosOcupados} / ${totalEmpleados}`,
        `Empleados Disponibles,${empleadosDisponibles}`,
        `Ingresos del Mes,${Number(ingresosMes._sum.montoAcordado ?? 0)}`,
        `Clientes Nuevos,${clientesNuevos}`,
        "",
        "Proyectos por Estado",
        "Estado,Cantidad",
        ...proyectosPorEstado.map((p) => `${ESTADO_LABELS[p.estado] ?? p.estado},${p._count}`),
      ]

      return new NextResponse(lines.join("\n"), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="dashboard-${desde.toISOString().slice(0, 10)}.csv"`,
        },
      })
    }

    const workbook = new ExcelJS.Workbook()
    workbook.creator = "LoBeMo Seguridad Informatica"
    workbook.created = new Date()

    const resumenSheet = workbook.addWorksheet("Resumen")
    resumenSheet.columns = [
      { header: "Metrica", key: "metrica", width: 30 },
      { header: "Valor", key: "valor", width: 20 },
    ]

    resumenSheet.getRow(1).font = { bold: true }
    resumenSheet.addRow({ metrica: "Periodo Desde", valor: desde.toLocaleDateString("es-AR") })
    resumenSheet.addRow({ metrica: "Periodo Hasta", valor: hasta.toLocaleDateString("es-AR") })
    resumenSheet.addRow({ metrica: "Proyectos Activos", valor: proyectosActivos })
    resumenSheet.addRow({ metrica: "Empleados Ocupados", valor: `${empleadosOcupados} / ${totalEmpleados}` })
    resumenSheet.addRow({ metrica: "Empleados Disponibles", valor: empleadosDisponibles })
    resumenSheet.addRow({ metrica: "Ingresos del Mes", valor: Number(ingresosMes._sum.montoAcordado ?? 0) })
    resumenSheet.addRow({ metrica: "Clientes Nuevos", valor: clientesNuevos })

    const estadosSheet = workbook.addWorksheet("Proyectos por Estado")
    estadosSheet.columns = [
      { header: "Estado", key: "estado", width: 25 },
      { header: "Cantidad", key: "cantidad", width: 15 },
    ]

    estadosSheet.getRow(1).font = { bold: true }
    for (const p of proyectosPorEstado) {
      estadosSheet.addRow({ estado: ESTADO_LABELS[p.estado] ?? p.estado, cantidad: p._count })
    }

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="dashboard-${desde.toISOString().slice(0, 10)}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error exporting dashboard:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
