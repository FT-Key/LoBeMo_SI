import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { validateBody } from "@/lib/api-validate"
import { updateEmpleadoSchema } from "@/shared/validation"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.rol !== "GERENTE_GENERAL") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const empleado = await prisma.empleado.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        area: true,
        activo: true,
        fechaIngreso: true,
      },
    })

    if (!empleado) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
    }

    return NextResponse.json(empleado)
  } catch (error) {
    console.error("Error fetching employee:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.rol !== "GERENTE_GENERAL") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const result = validateBody(updateEmpleadoSchema, body)
    if (!result.success) return result.error

    const existing = await prisma.empleado.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
    }

    if (result.data.email && result.data.email !== existing.email) {
      const emailTaken = await prisma.empleado.findUnique({ where: { email: result.data.email } })
      if (emailTaken) {
        return NextResponse.json(
          { error: "Ya existe un empleado con ese email" },
          { status: 409 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (result.data.nombre !== undefined) updateData.nombre = result.data.nombre
    if (result.data.apellido !== undefined) updateData.apellido = result.data.apellido
    if (result.data.email !== undefined) updateData.email = result.data.email
    if (result.data.rol !== undefined) updateData.rol = result.data.rol
    if (result.data.area !== undefined) updateData.area = result.data.area
    if (result.data.password !== undefined && result.data.password !== "") {
      updateData.password = await bcrypt.hash(result.data.password, 12)
    }

    const empleado = await prisma.empleado.update({
      where: { id },
      data: updateData,
    })

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "Empleado",
        entidadId: id,
        detalle: { cambios: Object.keys(updateData), email: empleado.email },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({
      id: empleado.id,
      nombre: empleado.nombre,
      email: empleado.email,
      rol: empleado.rol,
    })
  } catch (error) {
    console.error("Error updating employee:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.rol !== "GERENTE_GENERAL") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const empleado = await prisma.empleado.findUnique({ where: { id } })

    if (!empleado) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 })
    }

    if (empleado.rol === "GERENTE_GENERAL") {
      return NextResponse.json(
        { error: "No se puede desactivar al Gerente General" },
        { status: 400 }
      )
    }

    if (empleado.id === session.user.id) {
      return NextResponse.json(
        { error: "No podés desactivar tu propia cuenta" },
        { status: 400 }
      )
    }

    const updated = await prisma.empleado.update({
      where: { id },
      data: { activo: !empleado.activo },
    })

    await prisma.auditLog.create({
      data: {
        accion: empleado.activo ? "DELETE" : "UPDATE",
        entidad: "Empleado",
        entidadId: id,
        detalle: {
          accion: empleado.activo ? "desactivacion" : "reactivacion",
          email: empleado.email,
        },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error toggling employee status:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
