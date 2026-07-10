import { z } from "zod"

export const ESTADOS_PROPUESTA = ["ENVIADA", "APROBADA", "RECHAZADA", "VENCIDA"] as const

export const createPropuestaSchema = z.object({
  proyectoId: z.string().min(1, "Debe seleccionar un proyecto"),
  montoTotal: z.number().positive("El monto total debe ser mayor a 0"),
  fechaEmision: z.string().min(1, "La fecha de emisión es obligatoria"),
  fechaVencimiento: z.string().min(1, "La fecha de vencimiento es obligatoria"),
  detalleServicios: z.array(z.object({
    concepto: z.string().min(1, "El concepto es obligatorio"),
    monto: z.number().positive("El monto debe ser mayor a 0"),
  })).optional(),
  recotizarId: z.string().optional(),
})

export const updatePropuestaSchema = z.object({
  estado: z.enum(ESTADOS_PROPUESTA).optional(),
})

export type CreatePropuestaFormData = z.infer<typeof createPropuestaSchema>
export type UpdatePropuestaFormData = z.infer<typeof updatePropuestaSchema>
