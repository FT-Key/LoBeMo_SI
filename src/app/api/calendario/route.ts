import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const empleadoId = session.user.id
    const rol = session.user.rol
    const esGlobal = ["GERENTE_GENERAL", "CISO", "ADMINISTRACION"].includes(rol)

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

    const [hitos, propuestas] = await Promise.all([
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
    ]

    return NextResponse.json({ eventos })
  } catch (error) {
    console.error("Error getting calendario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
