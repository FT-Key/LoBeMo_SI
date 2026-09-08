import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateBody } from "@/lib/api-validate"
import { updatePropuestaSchema } from "@/shared/validation"
import { withRole, ROLES, Rol } from "@/lib/api-auth"
import { logger } from "@/lib/logger"

export const GET = withRole(ROLES.CREATE_PROPUESTAS, async (_request, ctx) => {
  try {
    const { id } = await ctx.params

    const propuesta = await prisma.propuesta.findUnique({
      where: { id },
      include: {
        proyecto: {
          include: {
            cliente: { select: { id: true, razonSocial: true, cuit: true } },
            servicio: { select: { id: true, nombre: true } },
          },
        },
      },
    })

    if (!propuesta) {
      return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 })
    }

    if (propuesta.estado === "ENVIADA" && new Date(propuesta.fechaVencimiento) < new Date()) {
      const updated = await prisma.propuesta.update({
        where: { id },
        data: { estado: "RECHAZADA" },
        include: {
          proyecto: {
            include: {
              cliente: { select: { id: true, razonSocial: true, cuit: true } },
              servicio: { select: { id: true, nombre: true } },
            },
          },
        },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json(propuesta)
  } catch (error) {
    logger.error({ err: error }, "Error getting propuesta")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})

export const PATCH = withRole(ROLES.CREATE_PROPUESTAS, async (request, ctx, session) => {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const result = validateBody(updatePropuestaSchema, body)
    if (!result.success) return result.error

    if (!result.data.estado) {
      return NextResponse.json({ error: "El campo estado es obligatorio" }, { status: 400 })
    }

    const estadosValidos = ["ENVIADA", "ACEPTADA", "RECHAZADA", "RECOTIZADA"]
    if (!estadosValidos.includes(result.data.estado as string)) {
      return NextResponse.json(
        { error: `Estado no válido. Valores: ${estadosValidos.join(", ")}` },
        { status: 400 }
      )
    }

    const nuevoEstado = result.data.estado as string

    const propuesta = await prisma.propuesta.findUnique({
      where: { id },
      include: { proyecto: { select: { id: true, estado: true } } },
    })

    if (!propuesta) {
      return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 })
    }

    const puedeAceptar = ROLES.MANAGE_PROYECTOS.includes(session.user.rol as Rol)

    if (nuevoEstado === "ACEPTADA" && !puedeAceptar) {
      return NextResponse.json(
        { error: "Solo Gerente General o CISO pueden aceptar propuestas" },
        { status: 403 }
      )
    }

    if (propuesta.estado === "ACEPTADA" && nuevoEstado === "RECHAZADA") {
      return NextResponse.json(
        { error: "No se puede rechazar una propuesta ya aceptada" },
        { status: 400 }
      )
    }

    if (propuesta.estado !== "ENVIADA" && nuevoEstado !== "RECOTIZADA") {
      return NextResponse.json(
        { error: `No se puede cambiar estado de ${propuesta.estado} a ${nuevoEstado}` },
        { status: 400 }
      )
    }

    const updated = await prisma.propuesta.update({
      where: { id },
      data: { estado: nuevoEstado },
    })

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "Propuesta",
        entidadId: id,
        detalle: { cambioEstado: { desde: propuesta.estado, hasta: nuevoEstado } },
        empleadoId: session.user.id,
      },
    })

    if (nuevoEstado === "ACEPTADA") {
      const gerentes = await prisma.empleado.findMany({
        where: { rol: "GERENTE_GENERAL", activo: true },
        select: { id: true },
      })
      for (const g of gerentes) {
        await prisma.notificacion.create({
          data: {
            empleadoId: g.id,
            titulo: "Propuesta aceptada",
            mensaje: `La propuesta versión ${propuesta.version} del proyecto ha sido aceptada. Ya puede pasar a APROBADO.`,
            tipo: "CAMBIO_ESTADO",
            link: `/proyectos/${propuesta.proyecto.id}`,
          },
        })
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    logger.error({ err: error }, "Error updating propuesta")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
})
