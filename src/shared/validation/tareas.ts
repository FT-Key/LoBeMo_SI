import { z } from "zod"

export const PRIORIDADES_TAREA = ["BAJA", "MEDIA", "ALTA", "URGENTE"] as const
export const ESTADOS_TAREA = ["PENDIENTE", "EN_PROGRESO", "COMPLETADA", "CANCELADA"] as const

export const createTareaSchema = z.object({
  proyectoId: z.string().min(1, "Debe seleccionar un proyecto"),
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100, "El título no puede exceder 100 caracteres"),
  descripcion: z.string().max(1000, "La descripción no puede exceder 1000 caracteres").optional().or(z.literal("")),
  prioridad: z.enum(PRIORIDADES_TAREA).default("MEDIA"),
  fechaLimite: z.string().optional().or(z.literal("")),
  asignacionId: z.string().optional().or(z.literal("")),
})

export const updateTareaSchema = createTareaSchema.partial().extend({
  estado: z.enum(ESTADOS_TAREA).optional(),
})

export type CreateTareaFormData = z.infer<typeof createTareaSchema>
export type UpdateTareaFormData = z.infer<typeof updateTareaSchema>
