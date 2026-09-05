import { NextResponse, NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import { join } from "path"
import nodemailer from "nodemailer"

const emailSchema = z.object({
  email: z.string().email("Ingresá un email válido"),
})

function generarClaveTemporal(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  let result = ""
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = emailSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Ingresá un email válido" },
        { status: 400 }
      )
    }

    const { email } = result.data

    const cliente = await prisma.cliente.findFirst({
      where: { emailContacto: email, activo: true },
      select: { id: true, razonSocial: true },
    })

    if (!cliente) {
      return NextResponse.json(
        { error: "No se encontraron proyectos asociados a este email" },
        { status: 404 }
      )
    }

    const proyectos = await prisma.proyecto.findMany({
      where: { clienteId: cliente.id, portalActivo: true },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        estado: true,
        portalClave: true,
      },
      orderBy: { createdAt: "desc" },
    })

    if (proyectos.length === 0) {
      return NextResponse.json(
        { error: "No tenés proyectos con acceso al portal activo" },
        { status: 404 }
      )
    }

    const proyectosConClave = []
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    for (const p of proyectos) {
      const nuevaClave = generarClaveTemporal()
      const hashed = await bcrypt.hash(nuevaClave, 12)

      await prisma.proyecto.update({
        where: { id: p.id },
        data: { portalClave: hashed },
      })

      proyectosConClave.push({
        codigo: p.codigo,
        nombre: p.nombre,
        estado: p.estado,
        claveTemporal: nuevaClave,
      })

      if (user && pass) {
        try {
          const transport = nodemailer.createTransport({
            service: "gmail",
            auth: { user, pass },
          })

          let logoCid = ""
          let logoAttachment: { filename: string; content: Buffer; cid?: string }[] = []
          try {
            const logoBuffer = await readFile(join(process.cwd(), "public", "lobemo-logo.png"))
            logoCid = "logo@lobemo"
            logoAttachment = [{ filename: "lobemo-logo.png", content: logoBuffer, cid: logoCid }]
          } catch { /* logo not found */ }

          const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
          const portalUrl = `${baseUrl}/seguimiento/${p.codigo}`

          await transport.sendMail({
            from: `"LoBeMo Seguridad" <${user}>`,
            to: email,
            subject: `Tus credenciales de acceso - ${p.nombre}`,
            html: `
              <!DOCTYPE html>
              <html><head><meta charset="utf-8"></head>
              <body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Tahoma,sans-serif;">
                <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
                  ${logoCid ? `<img src="cid:${logoCid}" alt="LoBeMo" style="height:40px;margin-bottom:24px;" />` : ""}
                  <h1 style="color:#e2e8f0;font-size:20px;margin:0 0 8px;">Tus credenciales de acceso</h1>
                  <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">Estos son los datos para acceder al portal de seguimiento de tu proyecto</p>

                  <div style="background:#111827;border:1px solid #1e293b;border-radius:12px;padding:24px;margin-bottom:24px;">
                    <p style="color:#64748b;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Proyecto</p>
                    <p style="color:#f1f5f9;font-size:16px;font-weight:600;margin:0 0 16px;">${p.nombre}</p>

                    <div style="background:#1e293b;border-radius:8px;padding:12px;margin-bottom:12px;">
                      <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Código del Proyecto</p>
                      <p style="color:#00d4ff;font-size:14px;font-weight:600;margin:0;font-family:monospace;">${p.codigo}</p>
                    </div>

                    <div style="background:#1e293b;border-radius:8px;padding:12px;">
                      <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Contraseña</p>
                      <p style="color:#f1f5f9;font-size:14px;font-weight:600;margin:0;font-family:monospace;">${nuevaClave}</p>
                    </div>
                  </div>

                  <a href="${portalUrl}" style="display:inline-block;background:#00d4ff;color:#0a0a1a;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">Ingresar al portal</a>

                  <p style="color:#475569;font-size:12px;margin:24px 0 0;">Guardá estos datos. Los necesitás para acceder al seguimiento de tu proyecto.</p>

                  <hr style="border:none;border-top:1px solid #1e293b;margin:32px 0;" />
                  <p style="color:#475569;font-size:11px;margin:0;">LoBeMo Seguridad Informática · Portal de Seguimiento</p>
                </div>
              </body></html>
            `,
            attachments: logoAttachment,
          })
        } catch (emailError) {
          console.error(`Error sending credentials email for project ${p.codigo}:`, emailError)
        }
      }
    }

    return NextResponse.json({
      ok: true,
      cliente: cliente.razonSocial,
      proyectos: proyectosConClave,
    })
  } catch (error) {
    console.error("Project access lookup error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
