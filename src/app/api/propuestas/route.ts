import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const ROLES_PERMITIDOS_CREAR = ["GERENTE_GENERAL", "ADMINISTRACION", "VENTAS"]

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
    const search = searchParams.get("search") ?? ""
    const estado = searchParams.get("estado") ?? ""
    const proyectoId = searchParams.get("proyectoId") ?? ""

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { proyecto: { nombre: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (estado) {
      where.estado = estado
    }

    if (proyectoId) {
      where.proyectoId = proyectoId
    }

    const [propuestas, total] = await Promise.all([
      prisma.propuesta.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          proyecto: {
            select: { id: true, nombre: true, estado: true, cliente: { select: { razonSocial: true } } },
          },
        },
      }),
      prisma.propuesta.count({ where }),
    ])

    const now = new Date()
    for (const prop of propuestas) {
      if (prop.estado === "ENVIADA" && new Date(prop.fechaVencimiento) < now) {
        await prisma.propuesta.update({
          where: { id: prop.id },
          data: { estado: "RECHAZADA" },
        })
        prop.estado = "RECHAZADA"
      }
    }

    return NextResponse.json({
      data: propuestas,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error listing propuestas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (!ROLES_PERMITIDOS_CREAR.includes(session.user.rol)) {
      return NextResponse.json(
        { error: "Solo Administración, Ventas o Gerente General pueden crear propuestas" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { proyectoId, montoTotal, detalleServicios, fechaEmision, fechaVencimiento, recotizarId } = body

    if (!proyectoId || !montoTotal || !fechaVencimiento) {
      return NextResponse.json(
        { error: "Proyecto, monto total y fecha de vencimiento son obligatorios" },
        { status: 400 }
      )
    }

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: proyectoId },
      select: { id: true, estado: true, nombre: true },
    })

    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    if (proyecto.estado !== "RELEVAMIENTO" && proyecto.estado !== "PROPUESTA") {
      return NextResponse.json(
        { error: "Solo proyectos en estado RELEVAMIENTO o PROPUESTA pueden tener propuestas (AC-01)" },
        { status: 400 }
      )
    }

    const ultimaVersion = await prisma.propuesta.findFirst({
      where: { proyectoId },
      orderBy: { version: "desc" },
      select: { version: true },
    })

    const version = (ultimaVersion?.version ?? 0) + 1

    if (proyecto.estado === "RELEVAMIENTO") {
      await prisma.proyecto.update({
        where: { id: proyectoId },
        data: { estado: "PROPUESTA" },
      })
    }

    const propuesta = await prisma.propuesta.create({
      data: {
        proyectoId,
        version,
        montoTotal: parseFloat(montoTotal),
        detalleServicios: detalleServicios ?? null,
        fechaEmision: fechaEmision ? new Date(fechaEmision) : new Date(),
        fechaVencimiento: new Date(fechaVencimiento),
        estado: "ENVIADA",
      },
    })

    if (recotizarId) {
      const propuestaAnterior = await prisma.propuesta.findUnique({ where: { id: recotizarId } })
      if (propuestaAnterior && propuestaAnterior.proyectoId === proyectoId) {
        await prisma.propuesta.update({
          where: { id: recotizarId },
          data: { estado: "RECOTIZADA" },
        })
      }
    }

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "Propuesta",
        entidadId: propuesta.id,
        detalle: { proyectoId, version, montoTotal, recotizarId: recotizarId || null },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(propuesta, { status: 201 })
  } catch (error) {
    console.error("Error creating propuesta:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
