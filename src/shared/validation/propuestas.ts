import { z } from "zod"
import { isValidDateFormat } from "@/shared/utils/date-utils"

export const ESTADOS_PROPUESTA = ["ENVIADA", "APROBADA", "RECHAZADA", "VENCIDA"] as const

export const createPropuestaSchema = z.object({
  proyectoId: z.string().min(1, "Debe seleccionar un proyecto"),
  montoTotal: z.number().positive("El monto total debe ser mayor a 0"),
  fechaEmision: z.string().min(1, "La fecha de emisión es obligatoria").refine(
    (val) => isValidDateFormat(val),
    { message: "Formato de fecha inválido (usá AAAA-MM-DD)" }
  ),
  fechaVencimiento: z.string().min(1, "La fecha de vencimiento es obligatoria").refine(
    (val) => isValidDateFormat(val),
    { message: "Formato de fecha inválido (usá AAAA-MM-DD)" }
  ),
  detalleServicios: z.array(z.object({
    concepto: z.string().min(1, "El concepto es obligatorio"),
    monto: z.number().positive("El monto debe ser mayor a 0"),
  })).optional(),
  recotizarId: z.string().optional(),
}).refine(
  (data) => data.fechaVencimiento >= data.fechaEmision,
  { message: "La fecha de vencimiento no puede ser anterior a la de emisión", path: ["fechaVencimiento"] }
)

export const updatePropuestaSchema = z.object({
  estado: z.enum(ESTADOS_PROPUESTA).optional(),
})

export type CreatePropuestaFormData = z.infer<typeof createPropuestaSchema>
export type UpdatePropuestaFormData = z.infer<typeof updatePropuestaSchema>
