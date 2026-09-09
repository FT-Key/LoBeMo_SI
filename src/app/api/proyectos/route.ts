import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { validateBody } from "@/lib/api-validate"
import { createProyectoSchema } from "@/shared/validation"
import { generarCodigoProyecto } from "@/lib/proyecto-codigo"
import { withRole, ROLES } from "@/lib/api-auth"
import { logger } from "@/lib/logger"
import {
  resolverDestinatario,
  createTransporter,
  getLogoAttachment,
  portalBienvenida,
} from "@/lib/email-templates"

export const GET = withRole(ROLES.MANAGE_PROYECTOS, async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
    const search = searchParams.get("search") ?? ""
    const estado = searchParams.get("estado") ?? ""
    const clienteId = searchParams.get("clienteId") ?? ""
    const servicioId = searchParams.get("servicioId") ?? ""

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { descripcion: { contains: search, mode: "insensitive" } },
      ]
    }

    if (estado) {
      where.estado = estado
    }

    if (clienteId) {
      where.clienteId = clienteId
    }

    if (servicioId) {
      where.servicioId = servicioId
    }

    const [proyectos, total] = await Promise.all([
      prisma.proyecto.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          cliente: { select: { id: true, razonSocial: true } },
          servicio: { select: { id: true, nombre: true } },
          _count: { select: { tareas: true, asignaciones: true, propuestas: true } },
          historialEstados: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { estadoNuevo: true, createdAt: true },
          },
        },
      }),
      prisma.proyecto.count({ where }),
    ])

    return NextResponse.json({
      data: proyectos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error({ err: error }, "Error listing projects")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})

export const POST = withRole(ROLES.MANAGE_PROYECTOS, async (request, _ctx, session) => {
  try {
    const body = await request.json()
    const result = validateBody(createProyectoSchema, body)
    if (!result.success) return result.error

    const cliente = await prisma.cliente.findUnique({ where: { id: result.data.clienteId } })
    if (!cliente || !cliente.activo) {
      return NextResponse.json(
        { error: "Cliente no encontrado o inactivo" },
        { status: 400 }
      )
    }

    const servicio = await prisma.servicio.findUnique({ where: { id: result.data.servicioId } })
    if (!servicio) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 400 }
      )
    }

    const codigo = await generarCodigoProyecto(result.data.nombre)

    const proyecto = await prisma.proyecto.create({
      data: {
        codigo,
        nombre: result.data.nombre,
        descripcion: result.data.descripcion || null,
        clienteId: result.data.clienteId,
        servicioId: result.data.servicioId,
        fechaEstimadaFin: result.data.fechaEstimadaFin ? new Date(result.data.fechaEstimadaFin) : null,
        montoAcordado: result.data.montoAcordado ? parseFloat(result.data.montoAcordado) : null,
        estado: "RELEVAMIENTO",
        portalClave: result.data.portalClave ? await bcrypt.hash(result.data.portalClave, 12) : null,
        portalActivo: result.data.portalActivo ?? false,
      },
    })

    if (result.data.portalActivo && result.data.portalClave && cliente.emailContacto) {
      try {
        const transport = createTransporter()
        if (transport) {
          const logoAttachment = await getLogoAttachment()
          const logoCid = logoAttachment.length > 0 ? logoAttachment[0].cid : ""
          const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
          const portalUrl = `${baseUrl}/seguimiento/${proyecto.codigo}`

          await transport.sendMail({
            from: `"LoBeMo Seguridad" <${process.env.SMTP_USER}>`,
            to: resolverDestinatario(cliente.emailContacto),
            subject: `Acceso al portal de seguimiento - ${proyecto.nombre}`,
            html: portalBienvenida({
              nombreProyecto: proyecto.nombre,
              codigo: proyecto.codigo,
              clave: result.data.portalClave,
              portalUrl,
              logoCid,
            }),
            attachments: logoAttachment,
          })
        }
      } catch (emailError) {
        logger.error({ err: emailError }, "Error sending portal welcome email")
      }
    }

    await prisma.historialEstado.create({
      data: {
        proyectoId: proyecto.id,
        estadoAnterior: null,
        estadoNuevo: "RELEVAMIENTO",
        empleadoId: session.user.id,
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "Proyecto",
        entidadId: proyecto.id,
        detalle: { nombre: result.data.nombre, clienteId: result.data.clienteId, servicioId: result.data.servicioId },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(proyecto, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, "Error creating project")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})
