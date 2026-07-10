import { z } from "zod"

export const ROLES = [
  "GERENTE_GENERAL", "ADMINISTRACION", "VENTAS", "CISO",
  "ANALISTA_SEGURIDAD", "DESARROLLADOR", "ESPECIALISTA_REDES",
  "PENTESTER", "SOPORTE_TECNICO", "AUDITOR", "CAPACITADOR",
] as const

export const AREAS = [
  "GERENCIA", "ADMINISTRACION", "COMERCIAL", "SISTEMAS", "AUDITORIA", "CAPACITACION",
] as const

export const createEmpleadoSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede exceder 50 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres").max(50, "El apellido no puede exceder 50 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum(ROLES, { message: "Rol inválido" }),
  area: z.enum(AREAS, { message: "Área inválida" }),
})

export const updateEmpleadoSchema = createEmpleadoSchema.partial().omit({ password: true }).extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
})

export type CreateEmpleadoFormData = z.infer<typeof createEmpleadoSchema>
export type UpdateEmpleadoFormData = z.infer<typeof updateEmpleadoSchema>
