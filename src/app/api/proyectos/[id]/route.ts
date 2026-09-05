import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"
import { readFile } from "fs/promises"
import { join } from "path"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { validateBody } from "@/lib/api-validate"
import { updateProyectoSchema } from "@/shared/validation"

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
    const proyecto = await prisma.proyecto.findUnique({
      where: { id },
      include: {
        cliente: true,
        servicio: true,
        propuestas: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        asignaciones: {
          include: {
            empleado: { select: { id: true, nombre: true, apellido: true, rol: true } },
          },
        },
        tareas: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        hitos: {
          orderBy: { fechaPrevista: "asc" },
        },
        historialEstados: {
          orderBy: { createdAt: "desc" },
          include: {
            empleado: { select: { id: true, nombre: true, apellido: true } },
          },
        },
        _count: { select: { tareas: true, asignaciones: true, propuestas: true, documentos: true } },
      },
    })

    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(proyecto)
  } catch (error) {
    console.error("Error getting project:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
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

    const puedeEditar = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"
    if (!puedeEditar) {
      return NextResponse.json(
        { error: "No tienes permisos para editar proyectos" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const result = validateBody(updateProyectoSchema, body)
    if (!result.success) return result.error

    const existing = await prisma.proyecto.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    if (existing.estado === "CERRADO") {
      return NextResponse.json(
        { error: "No se puede modificar un proyecto cerrado" },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (result.data.nombre !== undefined) updateData.nombre = result.data.nombre
    if (result.data.descripcion !== undefined) updateData.descripcion = result.data.descripcion || null
    if (result.data.fechaEstimadaFin !== undefined) updateData.fechaEstimadaFin = result.data.fechaEstimadaFin ? new Date(result.data.fechaEstimadaFin) : null
    if (result.data.montoAcordado !== undefined) updateData.montoAcordado = result.data.montoAcordado ? parseFloat(result.data.montoAcordado) : null
    if (result.data.portalActivo !== undefined) updateData.portalActivo = result.data.portalActivo
    if (result.data.portalClave !== undefined && result.data.portalClave !== "") {
      updateData.portalClave = await bcrypt.hash(result.data.portalClave, 12)
    }

    const portalActivado = result.data.portalActivo === true && existing.portalActivo === false
    const claveCambiada = result.data.portalClave !== undefined && result.data.portalClave !== ""
    const cliente = await prisma.cliente.findUnique({ where: { id: existing.clienteId } })

    const proyecto = await prisma.proyecto.update({
      where: { id },
      data: updateData,
    })

    if ((portalActivado || claveCambiada) && cliente?.emailContacto) {
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
          const portalUrl = `${baseUrl}/seguimiento/${proyecto.codigo}`
          const solicitarAccesoUrl = `${baseUrl}/solicitar-acceso`

          const asunto = portalActivado
            ? `Acceso al portal de seguimiento - ${proyecto.nombre}`
            : `Contraseña actualizada - ${proyecto.nombre}`
          const titulo = portalActivado
            ? "Portal de seguimiento habilitado"
            : "Tu contraseña fue actualizada"
          const subtitulo = portalActivado
            ? "Se habilitó el acceso al portal para tu proyecto"
            : "Se actualizó la contraseña de acceso a tu proyecto"

          await transport.sendMail({
            from: `"LoBeMo Seguridad" <${user}>`,
            to: cliente.emailContacto,
            subject: asunto,
            html: `
              <!DOCTYPE html>
              <html><head><meta charset="utf-8"></head>
              <body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Tahoma,sans-serif;">
                <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
                  ${logoCid ? `<img src="cid:${logoCid}" alt="LoBeMo" style="height:40px;margin-bottom:24px;" />` : ""}
                  <h1 style="color:#e2e8f0;font-size:20px;margin:0 0 8px;">${titulo}</h1>
                  <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">${subtitulo}</p>

                  <div style="background:#111827;border:1px solid #1e293b;border-radius:12px;padding:24px;margin-bottom:24px;">
                    <p style="color:#64748b;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Proyecto</p>
                    <p style="color:#f1f5f9;font-size:16px;font-weight:600;margin:0 0 16px;">${proyecto.nombre}</p>

                    <div style="background:#1e293b;border-radius:8px;padding:12px;margin-bottom:12px;">
                      <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Código del Proyecto</p>
                      <p style="color:#00d4ff;font-size:14px;font-weight:600;margin:0;font-family:monospace;">${proyecto.codigo}</p>
                    </div>

                    ${result.data.portalClave ? `
                    <div style="background:#1e293b;border-radius:8px;padding:12px;">
                      <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;">${portalActivado ? "Tu contraseña" : "Nueva contraseña"}</p>
                      <p style="color:#f1f5f9;font-size:14px;font-weight:600;margin:0;font-family:monospace;">${result.data.portalClave}</p>
                    </div>` : ""}
                  </div>

                  <a href="${portalUrl}" style="display:inline-block;background:#00d4ff;color:#0a0a1a;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">Ingresar al portal</a>

                  <p style="color:#475569;font-size:12px;margin:24px 0 0;">Guardá estos datos. Los necesitás para acceder al seguimiento de tu proyecto.</p>
                  <p style="color:#475569;font-size:12px;margin:4px 0 0;">Si no podés hacer clic en el botón, copiá y pegá este enlace:</p>
                  <p style="color:#00d4ff;font-size:12px;margin:4px 0 0;word-break:break-all;">${portalUrl}</p>
                  <p style="color:#475569;font-size:12px;margin:16px 0 0;">¿Olvidaste tus credenciales? <a href="${solicitarAccesoUrl}" style="color:#00d4ff;text-decoration:none;">Recuperá tu acceso acá</a></p>

                  <hr style="border:none;border-top:1px solid #1e293b;margin:32px 0;" />
                  <p style="color:#475569;font-size:11px;margin:0;">LoBeMo Seguridad Informática · Portal de Seguimiento</p>
                </div>
              </body></html>
            `,
            attachments: logoAttachment,
          })
        }
      } catch (emailError) {
        console.error("Error sending portal activation email:", emailError)
      }
    }

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "Proyecto",
        entidadId: id,
        detalle: { cambios: Object.keys(updateData) },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json(proyecto)
  } catch (error) {
    console.error("Error updating project:", error)
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

    if (session.user.rol !== "GERENTE_GENERAL") {
      return NextResponse.json(
        { error: "Solo el Gerente General puede eliminar proyectos" },
        { status: 403 }
      )
    }

    const { id } = await params
    const proyecto = await prisma.proyecto.findUnique({
      where: { id },
      include: { _count: { select: { tareas: true, propuestas: true, asignaciones: true } } },
    })

    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    if (proyecto.estado !== "RELEVAMIENTO") {
      return NextResponse.json(
        { error: "Solo se pueden eliminar proyectos en estado RELEVAMIENTO" },
        { status: 400 }
      )
    }

    await prisma.historialEstado.deleteMany({ where: { proyectoId: id } })
    await prisma.proyecto.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        accion: "DELETE",
        entidad: "Proyecto",
        entidadId: id,
        detalle: { nombre: proyecto.nombre },
        empleadoId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
