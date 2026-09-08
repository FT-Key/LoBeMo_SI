import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES } from "@/lib/api-auth"
import { logger } from "@/lib/logger"

export const GET = withRole(ROLES.VIEW_METRICAS, async (_request, ctx) => {
  try {
    const { id } = await ctx.params

    const proyecto = await prisma.proyecto.findUnique({
      where: { id },
      select: { id: true, nombre: true, estado: true },
    })

    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    const [tareas, hitos, asignaciones, registrosHoras] = await Promise.all([
      prisma.tarea.findMany({
        where: { proyectoId: id },
        select: { estado: true, prioridad: true },
      }),
      prisma.hito.findMany({
        where: { proyectoId: id },
        select: { completado: true },
      }),
      prisma.asignacion.findMany({
        where: { proyectoId: id },
        include: {
          empleado: { select: { id: true, nombre: true, apellido: true, rol: true } },
          _count: { select: { tareas: true } },
        },
      }),
      prisma.registroHoras.findMany({
        where: {
          tarea: { proyectoId: id },
          fin: { not: null },
        },
        select: {
          duracionMin: true,
          empleadoId: true,
          empleado: { select: { nombre: true, apellido: true } },
        },
      }),
    ])

    const tareasPorEstado: Record<string, number> = {}
    const tareasPorPrioridad: Record<string, number> = {}
    for (const t of tareas) {
      tareasPorEstado[t.estado] = (tareasPorEstado[t.estado] || 0) + 1
      tareasPorPrioridad[t.prioridad] = (tareasPorPrioridad[t.prioridad] || 0) + 1
    }

    const completadas = tareas.filter((t) => t.estado === "COMPLETADA").length
    const totalTareas = tareas.length
    const porcentajeAvance = totalTareas > 0 ? Math.round((completadas / totalTareas) * 100) : 0

    const hitosCompletados = hitos.filter((h) => h.completado).length
    const totalHitos = hitos.length
    const porcentajeHitos = totalHitos > 0 ? Math.round((hitosCompletados / totalHitos) * 100) : 0

    const totalMinutos = registrosHoras.reduce((sum, r) => sum + r.duracionMin, 0)
    const horasPorEmpleado: Record<string, { nombre: string; apellido: string; minutos: number }> = {}
    for (const r of registrosHoras) {
      if (!horasPorEmpleado[r.empleadoId]) {
        horasPorEmpleado[r.empleadoId] = { nombre: r.empleado.nombre, apellido: r.empleado.apellido, minutos: 0 }
      }
      horasPorEmpleado[r.empleadoId].minutos += r.duracionMin
    }

    return NextResponse.json({
      proyecto,
      tareas: {
        total: totalTareas,
        completadas,
        pendientes: totalTareas - completadas,
        porcentajeAvance,
        porEstado: tareasPorEstado,
        porPrioridad: tareasPorPrioridad,
      },
      hitos: {
        total: totalHitos,
        completados: hitosCompletados,
        pendientes: totalHitos - hitosCompletados,
        porcentaje: porcentajeHitos,
      },
      horas: {
        totalMinutos,
        registros: registrosHoras.length,
        porEmpleado: Object.values(horasPorEmpleado),
      },
      asignaciones: asignaciones.map((a) => ({
        id: a.id,
        empleado: `${a.empleado.nombre} ${a.empleado.apellido}`,
        rol: a.empleado.rol,
        tareasCount: a._count.tareas,
      })),
    })
  } catch (error) {
    logger.error({ err: error }, "Error getting metricas")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
