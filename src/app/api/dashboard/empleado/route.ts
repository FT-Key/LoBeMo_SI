import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole } from "@/lib/api-auth"
import { Rol } from "@/generated/prisma/enums"

const ALL_ROLES = Object.values(Rol)

export const GET = withRole(ALL_ROLES, async (_request, _ctx, session) => {
  try {
    const empleadoId = session.user.id

    const [asignaciones, tareasAsignadas, proyectosCount, tareasPorEstado, tareasPorPrioridad] =
      await Promise.all([
        prisma.asignacion.findMany({
          where: { empleadoId },
          include: {
            proyecto: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
                estado: true,
                fechaEstimadaFin: true,
                cliente: { select: { razonSocial: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.tarea.findMany({
          where: {
            asignacion: { empleadoId },
          },
          include: {
            proyecto: { select: { id: true, nombre: true, codigo: true } },
          },
          orderBy: [{ estado: "asc" }, { prioridad: "desc" }, { fechaLimite: "asc" }],
        }),
        prisma.asignacion.count({ where: { empleadoId } }),
        prisma.tarea.groupBy({
          by: ["estado"],
          where: { asignacion: { empleadoId } },
          _count: true,
        }),
        prisma.tarea.groupBy({
          by: ["prioridad"],
          where: { asignacion: { empleadoId } },
          _count: true,
        }),
      ])

    const tareasPendientes = tareasAsignadas.filter((t) => t.estado !== "COMPLETADA")
    const tareasCompletadas = tareasAsignadas.filter((t) => t.estado === "COMPLETADA")

    const proyectosActivos = asignaciones
      .map((a) => a.proyecto)
      .filter((p) => !["CERRADO"].includes(p.estado))

    return NextResponse.json({
      data: {
        resumen: {
          proyectosActivos: proyectosCount,
          totalTareas: tareasAsignadas.length,
          tareasPendientes: tareasPendientes.length,
          tareasCompletadas: tareasCompletadas.length,
        },
        proyectos: proyectosActivos,
        tareas: tareasAsignadas.slice(0, 20),
        tareasPorEstado,
        tareasPorPrioridad,
      },
    })
  } catch (error) {
    console.error("Error fetching employee dashboard:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})
