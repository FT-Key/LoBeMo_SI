import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { validateBody } from "@/lib/api-validate"
import { updateClienteSchema } from "@/shared/validation"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { id } = await params
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: { _count: { select: { proyectos: true } } },
  })

  if (!cliente) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
  }

  return NextResponse.json(cliente)
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
    const result = validateBody(updateClienteSchema, body)
    if (!result.success) return result.error

    const existing = await prisma.cliente.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    const cuit = result.data.cuit
    if (cuit && cuit !== existing.cuit && !body.confirmCuit) {
      return NextResponse.json(
        { error: "Cambiar el CUIT requiere confirmación adicional", requiereConfirmacion: true },
        { status: 400 }
      )
    }

    if (cuit && cuit !== existing.cuit) {
      const cuitExists = await prisma.cliente.findUnique({ where: { cuit } })
      if (cuitExists && cuitExists.activo) {
        return NextResponse.json(
          { error: "Ya existe un cliente activo con ese CUIT" },
          { status: 409 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (result.data.razonSocial !== undefined) updateData.razonSocial = result.data.razonSocial
    if (result.data.cuit !== undefined) updateData.cuit = result.data.cuit
    if (result.data.emailContacto !== undefined) updateData.emailContacto = result.data.emailContacto || null
    if (result.data.telefono !== undefined) updateData.telefono = result.data.telefono || null
    if (result.data.direccion !== undefined) updateData.direccion = result.data.direccion || null
    if (result.data.sector !== undefined) updateData.sector = result.data.sector || null

    const cliente = await prisma.cliente.update({
      where: { id },
      data: updateData,
    })

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "Cliente",
        entidadId: id,
        detalle: { cambios: Object.keys(updateData) },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(cliente)
  } catch (error) {
    console.error("Error updating client:", error)
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
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id } = await params
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        proyectos: {
          where: { estado: { in: ["EN_EJECUCION", "EN_REVISION", "APROBADO"] } },
        },
      },
    })

    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    }

    if (cliente.proyectos.length > 0) {
      return NextResponse.json(
        { error: "No se puede desactivar un cliente con proyectos activos" },
        { status: 400 }
      )
    }

    const updated = await prisma.cliente.update({
      where: { id },
      data: { activo: false },
    })

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "Cliente",
        entidadId: id,
        detalle: { accion: "desactivacion", razonSocial: cliente.razonSocial },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error deactivating client:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
