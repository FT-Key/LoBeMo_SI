import { z } from "zod"

export const SEVERIDADES = ["CRITICA", "ALTA", "MEDIA", "BAJA"] as const
export const ESTADOS_HALLAZGO = ["PENDIENTE", "APROBADO", "RECHAZADO"] as const

export const createHallazgoSchema = z.object({
  proyectoId: z.string().min(1, "Debe seleccionar un proyecto"),
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres").max(200, "El título no puede exceder 200 caracteres"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(5000, "La descripción no puede exceder 5000 caracteres"),
  severidad: z.enum(SEVERIDADES).default("MEDIA"),
  evidencia: z.string().max(5000, "La evidencia no puede exceder 5000 caracteres").optional().or(z.literal("")),
  recomendacion: z.string().max(5000, "La recomendación no puede exceder 5000 caracteres").optional().or(z.literal("")),
})

export const updateHallazgoSchema = createHallazgoSchema.partial().extend({
  estado: z.enum(ESTADOS_HALLAZGO).optional(),
})

export type CreateHallazgoFormData = z.infer<typeof createHallazgoSchema>
export type UpdateHallazgoFormData = z.infer<typeof updateHallazgoSchema>
