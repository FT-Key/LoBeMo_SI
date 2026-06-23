import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params

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
    console.error("Error getting propuesta:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { estado } = body

    if (!estado) {
      return NextResponse.json({ error: "El campo estado es obligatorio" }, { status: 400 })
    }

    const estadosValidos = ["ENVIADA", "ACEPTADA", "RECHAZADA", "RECOTIZADA"]
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: `Estado no válido. Valores: ${estadosValidos.join(", ")}` },
        { status: 400 }
      )
    }

    const propuesta = await prisma.propuesta.findUnique({
      where: { id },
      include: { proyecto: { select: { id: true, estado: true } } },
    })

    if (!propuesta) {
      return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 })
    }

    const puedeAceptar = ["GERENTE_GENERAL", "CISO"].includes(session.user.rol)

    if (estado === "ACEPTADA" && !puedeAceptar) {
      return NextResponse.json(
        { error: "Solo Gerente General o CISO pueden aceptar propuestas" },
        { status: 403 }
      )
    }

    if (propuesta.estado === "ACEPTADA" && estado === "RECHAZADA") {
      return NextResponse.json(
        { error: "No se puede rechazar una propuesta ya aceptada" },
        { status: 400 }
      )
    }

    if (propuesta.estado !== "ENVIADA" && estado !== "RECOTIZADA") {
      return NextResponse.json(
        { error: `No se puede cambiar estado de ${propuesta.estado} a ${estado}` },
        { status: 400 }
      )
    }

    const updated = await prisma.propuesta.update({
      where: { id },
      data: { estado },
    })

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "Propuesta",
        entidadId: id,
        detalle: { cambioEstado: { desde: propuesta.estado, hasta: estado } },
        empleadoId: session.user.id,
      },
    })

    if (estado === "ACEPTADA") {
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
          },
        })
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating propuesta:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
