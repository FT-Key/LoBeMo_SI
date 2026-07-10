import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Rol } from "@/generated/prisma/enums"
import { validateBody } from "@/lib/api-validate"
import { transicionEstadoSchema } from "@/shared/validation"

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
      include: {
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
