import { NextResponse, NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import {
  resolverDestinatario,
  createTransporter,
  getLogoAttachment,
  credenciales,
} from "@/lib/email-templates"

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
    const transport = createTransporter()

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

      if (transport) {
        try {
          const logoAttachment = await getLogoAttachment()
          const logoCid = logoAttachment.length > 0 ? logoAttachment[0].cid : ""
          const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
          const portalUrl = `${baseUrl}/seguimiento/${p.codigo}`

          await transport.sendMail({
            from: `"LoBeMo Seguridad" <${process.env.SMTP_USER}>`,
            to: resolverDestinatario(email),
            subject: `Tus credenciales de acceso - ${p.nombre}`,
            html: credenciales({
              nombreProyecto: p.nombre,
              codigo: p.codigo,
              clave: nuevaClave,
              portalUrl,
              logoCid,
            }),
            attachments: logoAttachment,
          })
        } catch (emailError) {
          logger.error({ err: emailError }, `Error sending credentials email for project ${p.codigo}`)
        }
      }
    }

    return NextResponse.json({
      ok: true,
      cliente: cliente.razonSocial,
      proyectos: proyectosConClave,
    })
  } catch (error) {
    logger.error({ err: error }, "Project access lookup error")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
