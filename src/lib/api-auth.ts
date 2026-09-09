import { auth } from "@/auth"
import { Session } from "next-auth"
import { NextResponse } from "next/server"
import { Rol } from "@/generated/prisma/enums"

export { Rol }

export const ROLES = {
  MANAGE_EMPLEADOS: [Rol.GERENTE_GENERAL] as Rol[],
  MANAGE_CLIENTES: [Rol.GERENTE_GENERAL, Rol.ADMINISTRACION, Rol.CISO] as Rol[],
  MANAGE_PROYECTOS: [Rol.GERENTE_GENERAL, Rol.CISO] as Rol[],
  CREATE_PROPUESTAS: [Rol.GERENTE_GENERAL, Rol.ADMINISTRACION, Rol.VENTAS] as Rol[],
  VIEW_SOPORTE: [Rol.SOPORTE_TECNICO, Rol.GERENTE_GENERAL, Rol.CISO] as Rol[],
  MANAGE_CAPACITACIONES: [Rol.CAPACITADOR, Rol.GERENTE_GENERAL] as Rol[],
  VIEW_DASHBOARD: [Rol.GERENTE_GENERAL, Rol.CISO, Rol.ADMINISTRACION] as Rol[],
  VIEW_METRICAS: [Rol.CISO, Rol.GERENTE_GENERAL] as Rol[],
  MANAGE_HALLAZGOS: [Rol.CISO, Rol.GERENTE_GENERAL] as Rol[],
  CREATE_HALLAZGOS: [Rol.PENTESTER, Rol.CISO, Rol.GERENTE_GENERAL] as Rol[],
  VIEW_AUDIT_LOG: [Rol.GERENTE_GENERAL] as Rol[],
  MANAGE_CONFIG: [Rol.GERENTE_GENERAL] as Rol[],
  DELETE_PROYECTOS: [Rol.GERENTE_GENERAL] as Rol[],
} as const

export function withRole(
  allowedRoles: readonly Rol[] | Rol[],
  handler: (
    request: Request,
    ctx: { params: Promise<Record<string, string>> },
    session: Session
  ) => Promise<NextResponse | Response>
) {
  return async (request: Request, ctx: { params: Promise<Record<string, string>> }) => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    if (!allowedRoles.includes(session.user.rol as Rol)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
    return handler(request, ctx, session as Session)
  }
}
