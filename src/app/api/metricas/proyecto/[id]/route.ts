import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const puedeVer = ["CISO", "GERENTE_GENERAL"].includes(session.user.rol)
    if (!puedeVer) {
      return NextResponse.json({ error: "Solo el CISO o Gerente General pueden ver métricas" }, { status: 403 })
    }

    const { id } = await params

    const proyecto = await prisma.proyecto.findUnique({
      where: { id },
      select: { id: true, nombre: true, estado: true },
    })

    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    const [tareas, hitos, asignaciones] = await Promise.all([
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
      asignaciones: asignaciones.map((a) => ({
        id: a.id,
        empleado: `${a.empleado.nombre} ${a.empleado.apellido}`,
        rol: a.empleado.rol,
        tareasCount: a._count.tareas,
      })),
    })
  } catch (error) {
    console.error("Error getting metricas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
