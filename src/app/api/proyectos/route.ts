import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import { readFile } from "fs/promises"
import { join } from "path"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { validateBody } from "@/lib/api-validate"
import { createProyectoSchema } from "@/shared/validation"

const ROLES_PERMITIDOS_CREAR = ["GERENTE_GENERAL", "CISO"]

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
    console.error("Error listing projects:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
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
        { error: "Solo el Gerente General o el CISO pueden crear proyectos" },
        { status: 403 }
      )
    }

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

    const proyecto = await prisma.proyecto.create({
      data: {
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
        const user = process.env.SMTP_USER
        const pass = process.env.SMTP_PASS
        if (user && pass) {
          const transport = nodemailer.createTransport({ service: "gmail", auth: { user, pass } })
          let logoCid = ""
          let logoAttachment: { filename: string; content: Buffer; cid?: string }[] = []
          try {
            const logoBuffer = await readFile(join(process.cwd(), "public", "lobemo-logo.png"))
            logoCid = "logo@lobemo"
            logoAttachment = [{ filename: "lobemo-logo.png", content: logoBuffer, cid: logoCid }]
          } catch { /* logo not found */ }

          const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
          const portalUrl = `${baseUrl}/seguimiento/${proyecto.id}`

          await transport.sendMail({
            from: `"LoBeMo Seguridad" <${user}>`,
            to: cliente.emailContacto,
            subject: `Acceso al portal de seguimiento - ${proyecto.nombre}`,
            html: `
              <!DOCTYPE html>
              <html><head><meta charset="utf-8"></head>
              <body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Tahoma,sans-serif;">
                <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
                  ${logoCid ? `<img src="cid:${logoCid}" alt="LoBeMo" style="height:40px;margin-bottom:24px;" />` : ""}
                  <h1 style="color:#e2e8f0;font-size:20px;margin:0 0 8px;">Bienvenido al portal de seguimiento</h1>
                  <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">Tu proyecto ha sido creado con acceso al portal</p>

                  <div style="background:#111827;border:1px solid #1e293b;border-radius:12px;padding:24px;margin-bottom:24px;">
                    <p style="color:#64748b;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Proyecto</p>
                    <p style="color:#f1f5f9;font-size:16px;font-weight:600;margin:0 0 16px;">${proyecto.nombre}</p>

                    <div style="background:#1e293b;border-radius:8px;padding:12px;margin-bottom:12px;">
                      <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;">ID del Proyecto</p>
                      <p style="color:#00d4ff;font-size:14px;font-weight:600;margin:0;font-family:monospace;">${proyecto.id}</p>
                    </div>

                    <div style="background:#1e293b;border-radius:8px;padding:12px;">
                      <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Tu contraseña</p>
                      <p style="color:#f1f5f9;font-size:14px;font-weight:600;margin:0;font-family:monospace;">${result.data.portalClave}</p>
                    </div>
                  </div>

                  <a href="${portalUrl}" style="display:inline-block;background:#00d4ff;color:#0a0a1a;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">Ingresar al portal</a>

                  <p style="color:#475569;font-size:12px;margin:24px 0 0;">Guardá estos datos. Los necesitás para acceder al seguimiento de tu proyecto.</p>
                  <p style="color:#475569;font-size:12px;margin:4px 0 0;">Si no podés hacer clic en el botón, copiá y pegá este enlace:</p>
                  <p style="color:#00d4ff;font-size:12px;margin:4px 0 0;word-break:break-all;">${portalUrl}</p>

                  <hr style="border:none;border-top:1px solid #1e293b;margin:32px 0;" />
                  <p style="color:#475569;font-size:11px;margin:0;">LoBeMo Seguridad Informática · Portal de Seguimiento</p>
                </div>
              </body></html>
            `,
            attachments: logoAttachment,
          })
        }
      } catch (emailError) {
        console.error("Error sending portal welcome email:", emailError)
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
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
