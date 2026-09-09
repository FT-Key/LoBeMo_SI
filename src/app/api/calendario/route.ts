import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES, Rol } from "@/lib/api-auth"
import { logger } from "@/lib/logger"

export const GET = withRole([...ROLES.VIEW_DASHBOARD, Rol.VENTAS, Rol.SOPORTE_TECNICO, Rol.CAPACITADOR, Rol.PENTESTER], async (_request, _ctx, session) => {
  try {
    const empleadoId = session.user.id
    const rol = session.user.rol as Rol
    const esGlobal = ROLES.VIEW_DASHBOARD.includes(rol)

    let proyectoIds: string[]
    if (esGlobal) {
      const proyectos = await prisma.proyecto.findMany({ select: { id: true } })
      proyectoIds = proyectos.map((p) => p.id)
    } else {
      const asignaciones = await prisma.asignacion.findMany({
        where: { empleadoId },
        select: { proyectoId: true },
      })
      proyectoIds = asignaciones.map((a) => a.proyectoId)
    }

    const [hitos, tareas, propuestas] = await Promise.all([
      prisma.hito.findMany({
        where: { proyectoId: { in: proyectoIds } },
        select: {
          id: true,
          nombre: true,
          fechaPrevista: true,
          completado: true,
          proyecto: { select: { id: true, nombre: true } },
        },
        orderBy: { fechaPrevista: "asc" },
      }),
      prisma.tarea.findMany({
        where: { proyectoId: { in: proyectoIds }, fechaLimite: { not: null } },
        select: {
          id: true,
          titulo: true,
          estado: true,
          prioridad: true,
          fechaLimite: true,
          proyecto: { select: { id: true, nombre: true } },
        },
        orderBy: { fechaLimite: "asc" },
      }),
      prisma.propuesta.findMany({
        where: { proyectoId: { in: proyectoIds }, estado: { not: "ACEPTADA" } },
        select: {
          id: true,
          fechaVencimiento: true,
          estado: true,
          proyecto: { select: { id: true, nombre: true } },
        },
        orderBy: { fechaVencimiento: "asc" },
      }),
    ])

    const eventos = [
      ...hitos.map((h) => ({
        id: h.id,
        tipo: "hito" as const,
        titulo: h.nombre,
        fecha: h.fechaPrevista.toISOString(),
        completado: h.completado,
        proyecto: h.proyecto,
      })),
      ...propuestas
        .filter((p) => p.fechaVencimiento)
        .map((p) => ({
          id: p.id,
          tipo: "vencimiento" as const,
          titulo: `Vence propuesta - ${p.proyecto.nombre}`,
          fecha: p.fechaVencimiento!.toISOString(),
          estado: p.estado,
          proyecto: p.proyecto,
        })),
      ...tareas
        .filter((t) => t.fechaLimite)
        .map((t) => ({
          id: t.id,
          tipo: "tarea" as const,
          titulo: t.titulo,
          fecha: t.fechaLimite!.toISOString(),
          estado: t.estado,
          prioridad: t.prioridad,
          proyecto: t.proyecto,
        })),
    ]

    return NextResponse.json({ eventos })
  } catch (error) {
    logger.error({ err: error }, "Error getting calendario")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
