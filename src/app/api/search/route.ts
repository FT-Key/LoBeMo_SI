import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES } from "@/lib/api-auth"

export const GET = withRole(ROLES.VIEW_DASHBOARD, async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const term = `%${q}%`

    const [proyectos, clientes, empleados, tareas] = await Promise.all([
      prisma.proyecto.findMany({
        where: {
          OR: [
            { nombre: { contains: term, mode: "insensitive" } },
            { cliente: { razonSocial: { contains: term, mode: "insensitive" } } },
          ],
        },
        select: { id: true, nombre: true, estado: true },
        take: 5,
      }),
      prisma.cliente.findMany({
        where: {
          OR: [
            { razonSocial: { contains: term, mode: "insensitive" } },
            { cuit: { contains: term, mode: "insensitive" } },
          ],
        },
        select: { id: true, razonSocial: true, cuit: true },
        take: 5,
      }),
      prisma.empleado.findMany({
        where: {
          activo: true,
          OR: [
            { nombre: { contains: term, mode: "insensitive" } },
            { apellido: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
          ],
        },
        select: { id: true, nombre: true, apellido: true, rol: true },
        take: 5,
      }),
      prisma.tarea.findMany({
        where: {
          titulo: { contains: term, mode: "insensitive" },
        },
        select: { id: true, titulo: true, estado: true, prioridad: true },
        take: 5,
      }),
    ])

    return NextResponse.json({
      results: [
        ...proyectos.map((p) => ({
          tipo: "proyecto" as const,
          id: p.id,
          titulo: p.nombre,
          subtitulo: p.estado,
          href: `/proyectos/${p.id}`,
        })),
        ...clientes.map((c) => ({
          tipo: "cliente" as const,
          id: c.id,
          titulo: c.razonSocial,
          subtitulo: c.cuit,
          href: `/clientes/${c.id}`,
        })),
        ...empleados.map((e) => ({
          tipo: "empleado" as const,
          id: e.id,
          titulo: `${e.nombre} ${e.apellido}`,
          subtitulo: e.rol.replace(/_/g, " "),
          href: `/empleados/${e.id}`,
        })),
        ...tareas.map((t) => ({
          tipo: "tarea" as const,
          id: t.id,
          titulo: t.titulo,
          subtitulo: `${t.estado} — ${t.prioridad}`,
          href: null,
        })),
      ],
    })
  } catch (error) {
    console.error("Error in global search:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
