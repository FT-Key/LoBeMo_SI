import { z } from "zod"

export const ESTADOS_PROYECTO = [
  "RELEVAMIENTO", "PROPUESTA", "APROBADO", "EN_EJECUCION",
  "EN_REVISION", "ENTREGADO", "CERRADO",
] as const

export const createProyectoSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional().or(z.literal("")),
  clienteId: z.string().min(1, "Debe seleccionar un cliente"),
  servicioId: z.string().min(1, "Debe seleccionar un servicio"),
  fechaEstimadaFin: z.string().optional().or(z.literal("")),
  montoAcordado: z.string().optional().or(z.literal("")),
})

export const updateProyectoSchema = createProyectoSchema.partial().extend({
  estado: z.enum(ESTADOS_PROYECTO).optional(),
})

export const transicionEstadoSchema = z.object({
  nuevoEstado: z.enum(ESTADOS_PROYECTO, { message: "Estado inválido" }),
})

export type CreateProyectoFormData = z.infer<typeof createProyectoSchema>
export type UpdateProyectoFormData = z.infer<typeof updateProyectoSchema>
export type TransicionEstadoFormData = z.infer<typeof transicionEstadoSchema>
