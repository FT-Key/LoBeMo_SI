import { z } from "zod"

export const ESTADOS_INFORME = ["BORRADOR", "COMPLETADO"] as const

export const createInformeSchema = z.object({
  proyectoId: z.string().min(1, "Debe seleccionar un proyecto"),
  alcance: z.string().min(10, "El alcance debe tener al menos 10 caracteres").max(5000, "El alcance no puede exceder 5000 caracteres"),
  criteriosAuditoria: z.string().min(10, "Los criterios de auditoría deben tener al menos 10 caracteres").max(5000, "Los criterios no pueden exceder 5000 caracteres"),
})

export const updateInformeSchema = createInformeSchema.partial().extend({
  estado: z.enum(ESTADOS_INFORME).optional(),
  hallazgos: z.array(z.any()).optional(),
  noConformidades: z.array(z.any()).optional(),
  observaciones: z.array(z.any()).optional(),
  recomendaciones: z.array(z.any()).optional(),
})

export type CreateInformeFormData = z.infer<typeof createInformeSchema>
export type UpdateInformeFormData = z.infer<typeof updateInformeSchema>
