import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { readFile } from "fs/promises"
import { join } from "path"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Rol } from "@/generated/prisma/enums"
import { validateBody } from "@/lib/api-validate"
import { transicionEstadoSchema } from "@/shared/validation"
import { resolverDestinatario } from "@/lib/email"

interface TransicionValida {
  desde: string[]
  hasta: string
  validar: (proyecto: { id: string; estado: string }) => Promise<{ valido: boolean; error?: string }>
}

const TRANSICIONES: Record<string, TransicionValida> = {
  PROPUESTA: {
    desde: ["RELEVAMIENTO"],
    hasta: "PROPUESTA",
    validar: async (proyecto) => {
      const propuestas = await prisma.propuesta.count({
        where: { proyectoId: proyecto.id },
      })
      if (propuestas === 0) {
        return { valido: false, error: "Se requiere al menos una propuesta asociada (RN-02)" }
      }
      return { valido: true }
    },
  },
  APROBADO: {
    desde: ["PROPUESTA"],
    hasta: "APROBADO",
    validar: async (proyecto) => {
      const propuestaAceptada = await prisma.propuesta.findFirst({
        where: { proyectoId: proyecto.id, estado: "ACEPTADA" },
      })
      if (!propuestaAceptada) {
        return { valido: false, error: "Se requiere una propuesta en estado ACEPTADA (RN-03)" }
      }
      const proy = await prisma.proyecto.findUnique({ where: { id: proyecto.id } })
      if (!proy?.montoAcordado) {
        return { valido: false, error: "Se requiere un monto acordado registrado (RN-03)" }
      }
      return { valido: true }
    },
  },
  EN_EJECUCION: {
    desde: ["APROBADO", "EN_REVISION"],
    hasta: "EN_EJECUCION",
    validar: async (proyecto) => {
      const asignaciones = await prisma.asignacion.findMany({
        where: { proyectoId: proyecto.id },
        include: { empleado: { select: { rol: true } } },
      })
      if (asignaciones.length === 0) {
        return { valido: false, error: "Se requiere al menos un empleado asignado (RN-04)" }
      }
      const tieneTecnico = asignaciones.some((a) => ROLES_TECNICOS.includes(a.empleado.rol))
      if (!tieneTecnico) {
        return { valido: false, error: "Se requiere al menos un empleado TÉCNICO asignado (CISO, Analista, Desarrollador, etc.) (RN-04)" }
      }
      return { valido: true }
    },
  },
  EN_REVISION: {
    desde: ["EN_EJECUCION"],
    hasta: "EN_REVISION",
    validar: async () => {
      return { valido: true }
    },
  },
  ENTREGADO: {
    desde: ["EN_REVISION", "EN_EJECUCION"],
    hasta: "ENTREGADO",
    validar: async (proyecto) => {
      const tareasPendientes = await prisma.tarea.count({
        where: { proyectoId: proyecto.id, estado: { not: "COMPLETADA" } },
      })
      if (tareasPendientes > 0) {
        return { valido: false, error: `Hay ${tareasPendientes} tarea(s) pendiente(s). Todas deben estar COMPLETADA (RN-06)` }
      }
      return { valido: true }
    },
  },
  CERRADO: {
    desde: ["ENTREGADO"],
    hasta: "CERRADO",
    validar: async () => {
      return { valido: true }
    },
  },
}

const ROLES_CREAR = ["GERENTE_GENERAL", "CISO"]
const ROLES_REVISION = ["GERENTE_GENERAL", "CISO", "AUDITOR"]
const ROLES_TECNICOS = ["CISO", "ANALISTA_SEGURIDAD", "DESARROLLADOR", "ESPECIALISTA_REDES", "PENTESTER", "SOPORTE_TECNICO", "AUDITOR", "CAPACITADOR"]

export async function POST(
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
    const result = validateBody(transicionEstadoSchema, body)
    if (!result.success) return result.error

    const { nuevoEstado } = result.data

    const proyecto = await prisma.proyecto.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        estado: true,
        portalActivo: true,
        tareas: { select: { estado: true } },
        asignaciones: { select: { empleadoId: true } },
      },
    })

    if (!proyecto) {
      return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 })
    }

    if (proyecto.estado === "CERRADO") {
      return NextResponse.json(
        { error: "El proyecto ya está CERRADO. No se pueden realizar más transiciones (RN-07)" },
        { status: 400 }
      )
    }

    const transicion = TRANSICIONES[nuevoEstado]
    if (!transicion) {
      return NextResponse.json(
        { error: `Estado destino "${nuevoEstado}" no válido` },
        { status: 400 }
      )
    }

    if (!transicion.desde.includes(proyecto.estado)) {
      return NextResponse.json(
        {
          error: `No se puede pasar de ${proyecto.estado} a ${nuevoEstado}. Transiciones válidas: ${Object.entries(TRANSICIONES)
            .filter(([, t]) => t.desde.includes(proyecto.estado))
            .map(([k]) => k)
            .join(", ") || "ninguna (estado terminal)"}`,
        },
        { status: 400 }
      )
    }

    if (nuevoEstado !== "EN_REVISION") {
      if (!ROLES_CREAR.includes(session.user.rol) && session.user.rol !== "ADMINISTRACION" && session.user.rol !== "VENTAS") {
        return NextResponse.json(
          { error: "No tienes permisos para cambiar el estado del proyecto" },
          { status: 403 }
        )
      }
    } else if (!ROLES_REVISION.includes(session.user.rol)) {
      return NextResponse.json(
        { error: "Solo el Gerente General, CISO o Auditor pueden poner un proyecto en revisión (RN-05)" },
        { status: 403 }
      )
    }

    const validacion = await transicion.validar(proyecto)
    if (!validacion.valido) {
      return NextResponse.json({ error: validacion.error }, { status: 400 })
    }

    const estadoAnterior = proyecto.estado

    const proyectoActualizado = await prisma.proyecto.update({
      where: { id },
      data: {
        estado: nuevoEstado,
        fechaEntregaReal: nuevoEstado === "ENTREGADO" ? new Date() : undefined,
      },
    })

    await prisma.historialEstado.create({
      data: {
        proyectoId: id,
        estadoAnterior,
        estadoNuevo: nuevoEstado,
        empleadoId: session.user.id,
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "UPDATE",
        entidad: "Proyecto",
        entidadId: id,
        detalle: { cambioEstado: { desde: estadoAnterior, hasta: nuevoEstado } },
        empleadoId: session.user.id,
      },
    })

    if (proyecto.portalActivo) {
      const proyCompleto = await prisma.proyecto.findUnique({
        where: { id },
        include: { cliente: { select: { emailContacto: true, razonSocial: true } } },
      })

      if (proyCompleto?.cliente.emailContacto) {
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
            } catch { /* logo not found, skip */ }

            const ESTADOS_LABELS: Record<string, string> = {
              RELEVAMIENTO: "Relevamiento",
              PROPUESTA: "Propuesta",
              APROBADO: "Aprobado",
              EN_EJECUCION: "En Ejecución",
              EN_REVISION: "En Revisión",
              ENTREGADO: "Entregado",
              CERRADO: "Cerrado",
            }

            const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
            const portalUrl = `${baseUrl}/seguimiento/${proyecto.id}`

            await transport.sendMail({
              from: `"LoBeMo Seguridad" <${user}>`,
              to: resolverDestinatario(proyCompleto.cliente.emailContacto),
              subject: `Estado del proyecto "${proyecto.nombre}" actualizado`,
              html: `
                <!DOCTYPE html>
                <html><head><meta charset="utf-8"></head>
                <body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Tahoma,sans-serif;">
                  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
                    ${logoCid ? `<img src="cid:${logoCid}" alt="LoBeMo" style="height:40px;margin-bottom:24px;" />` : ""}
                    <h1 style="color:#e2e8f0;font-size:20px;margin:0 0 8px;">Actualización de estado</h1>
                    <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">Tu proyecto ha cambiado de estado</p>

                    <div style="background:#111827;border:1px solid #1e293b;border-radius:12px;padding:24px;margin-bottom:24px;">
                      <p style="color:#64748b;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Proyecto</p>
                      <p style="color:#f1f5f9;font-size:16px;font-weight:600;margin:0 0 16px;">${proyecto.nombre}</p>

                      <div style="display:flex;gap:16px;margin-bottom:0;">
                        <div style="flex:1;background:#1e293b;border-radius:8px;padding:12px;">
                          <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Anterior</p>
                          <p style="color:#94a3b8;font-size:14px;margin:0;">${ESTADOS_LABELS[estadoAnterior] || estadoAnterior}</p>
                        </div>
                        <div style="flex:0 0 auto;display:flex;align-items:center;color:#00d4ff;font-size:20px;">→</div>
                        <div style="flex:1;background:#1e293b;border-radius:8px;padding:12px;">
                          <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;">Nuevo</p>
                          <p style="color:#00d4ff;font-size:14px;font-weight:600;margin:0;">${ESTADOS_LABELS[nuevoEstado] || nuevoEstado}</p>
                        </div>
                      </div>
                    </div>

                    <a href="${portalUrl}" style="display:inline-block;background:#00d4ff;color:#0a0a1a;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;">Ver seguimiento del proyecto</a>

                    <p style="color:#475569;font-size:12px;margin:24px 0 0;">Si no podés hacer clic en el botón, copiá y pegá este enlace en tu navegador:</p>
                    <p style="color:#00d4ff;font-size:12px;margin:4px 0 0;word-break:break-all;">${portalUrl}</p>

                    <hr style="border:none;border-top:1px solid #1e293b;margin:32px 0;" />
                    <p style="color:#475569;font-size:11px;margin:0;">LoBeMo Seguridad Informática · Seguimiento de Proyectos</p>
                  </div>
                </body></html>
              `,
              attachments: logoAttachment,
            })
          }
        } catch (emailError) {
          console.error("Error sending portal notification email:", emailError)
        }
      }
    }

    if (nuevoEstado === "ENTREGADO" || nuevoEstado === "EN_REVISION") {
      const rolesANotificar: Rol[] = [Rol.GERENTE_GENERAL, Rol.CISO]

      const empleadosANotificar = await prisma.empleado.findMany({
        where: { rol: { in: rolesANotificar }, activo: true },
      })

      for (const emp of empleadosANotificar) {
        await prisma.notificacion.create({
          data: {
            empleadoId: emp.id,
            titulo: `Proyecto "${proyecto.nombre}" cambió a ${nuevoEstado}`,
            mensaje: `El proyecto pasó de ${estadoAnterior} a ${nuevoEstado}`,
            tipo: "CAMBIO_ESTADO",
            link: `/proyectos/${proyecto.id}`,
          },
        })
      }
    }

    return NextResponse.json(proyectoActualizado)
  } catch (error) {
    console.error("Error en transicion de estado:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
