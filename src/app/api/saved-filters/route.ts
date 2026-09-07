import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole } from "@/lib/api-auth"
import { Rol } from "@/generated/prisma/enums"

const ALL_ROLES = Object.values(Rol)

export const GET = withRole(ALL_ROLES, async (request, _ctx, session) => {
  try {
    const { searchParams } = new URL(request.url)
    const modulo = searchParams.get("modulo")

    if (!modulo) {
      return NextResponse.json(
        { error: "El parámetro 'modulo' es requerido" },
        { status: 400 }
      )
    }

    const filters = await prisma.savedFilter.findMany({
      where: {
        empleadoId: session.user.id,
        modulo,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nombre: true,
        modulo: true,
        filtros: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ data: filters })
  } catch (error) {
    console.error("Error fetching saved filters:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})

export const POST = withRole(ALL_ROLES, async (request, _ctx, session) => {
  try {
    const body = await request.json()
    const { nombre, modulo, filtros } = body

    if (!nombre || !modulo || !filtros) {
      return NextResponse.json(
        { error: "Los campos 'nombre', 'modulo' y 'filtros' son requeridos" },
        { status: 400 }
      )
    }

    if (typeof nombre !== "string" || nombre.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre debe ser un string no vacío" },
        { status: 400 }
      )
    }

    if (nombre.trim().length > 50) {
      return NextResponse.json(
        { error: "El nombre debe tener máximo 50 caracteres" },
        { status: 400 }
      )
    }

    const existing = await prisma.savedFilter.findUnique({
      where: {
        empleadoId_modulo_nombre: {
          empleadoId: session.user.id,
          modulo,
          nombre: nombre.trim(),
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un filtro guardado con ese nombre en este módulo" },
        { status: 409 }
      )
    }

    const filter = await prisma.savedFilter.create({
      data: {
        nombre: nombre.trim(),
        modulo,
        filtros,
        empleadoId: session.user.id,
      },
      select: {
        id: true,
        nombre: true,
        modulo: true,
        filtros: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ data: filter }, { status: 201 })
  } catch (error) {
    console.error("Error creating saved filter:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})

export const DELETE = withRole(ALL_ROLES, async (request, _ctx, session) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "El parámetro 'id' es requerido" },
        { status: 400 }
      )
    }

    const filter = await prisma.savedFilter.findUnique({
      where: { id },
    })

    if (!filter) {
      return NextResponse.json(
        { error: "Filtro no encontrado" },
        { status: 404 }
      )
    }

    if (filter.empleadoId !== session.user.id) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este filtro" },
        { status: 403 }
      )
    }

    await prisma.savedFilter.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting saved filter:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})
