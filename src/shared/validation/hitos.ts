import { z } from "zod"

export const createHitoSchema = z.object({
  proyectoId: z.string().min(1, "Debe seleccionar un proyecto"),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional().or(z.literal("")),
  fechaPrevista: z.string().min(1, "La fecha prevista es obligatoria"),
})

export const updateHitoSchema = createHitoSchema.partial().extend({
  completado: z.boolean().optional(),
  fechaReal: z.string().optional().or(z.literal("")),
})

export type CreateHitoFormData = z.infer<typeof createHitoSchema>
export type UpdateHitoFormData = z.infer<typeof updateHitoSchema>
