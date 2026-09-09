import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES } from "@/lib/api-auth"
import { validateBody } from "@/lib/api-validate"
import { updateEmpleadoSchema } from "@/shared/validation"
import { logger } from "@/lib/logger"

export const GET = withRole(ROLES.MANAGE_EMPLEADOS, async (_request, ctx) => {
  try {
    const { id } = await ctx.params
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
    logger.error({ err: error }, "Error fetching employee")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})

export const PUT = withRole(ROLES.MANAGE_EMPLEADOS, async (request, ctx, session) => {
  try {
    const { id } = await ctx.params
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

    if (id === session.user.id) {
      if (result.data.rol !== undefined && result.data.rol !== existing.rol) {
        return NextResponse.json(
          { error: "No podés cambiar tu propio rol" },
          { status: 400 }
        )
      }
      if (result.data.password !== undefined && result.data.password !== "") {
        if (!result.data.currentPassword) {
          return NextResponse.json(
            { error: "Debés ingresar tu contraseña actual para cambiarla" },
            { status: 400 }
          )
        }
        const isValid = await bcrypt.compare(result.data.currentPassword, existing.password)
        if (!isValid) {
          return NextResponse.json(
            { error: "La contraseña actual es incorrecta" },
            { status: 400 }
          )
        }
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
    logger.error({ err: error }, "Error updating employee")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})

export const DELETE = withRole(ROLES.MANAGE_EMPLEADOS, async (_request, ctx, session) => {
  try {
    const { id } = await ctx.params
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
    logger.error({ err: error }, "Error toggling employee status")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})
