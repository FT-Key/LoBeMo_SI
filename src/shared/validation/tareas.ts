import { z } from "zod"
import { getTodayISO, isValidDateFormat } from "@/shared/utils/date-utils"

export const PRIORIDADES_TAREA = ["BAJA", "MEDIA", "ALTA", "CRITICA", "URGENTE"] as const
export const ESTADOS_TAREA = ["PENDIENTE", "EN_PROGRESO", "COMPLETADA", "CANCELADA"] as const

const createTareaBase = z.object({
  proyectoId: z.string().min(1, "Debe seleccionar un proyecto"),
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100, "El título no puede exceder 100 caracteres"),
  descripcion: z.string().max(1000, "La descripción no puede exceder 1000 caracteres").optional().nullable().or(z.literal("")),
  prioridad: z.enum(PRIORIDADES_TAREA).default("MEDIA"),
  fechaLimite: z.string().optional().nullable().or(z.literal("")),
  asignacionId: z.string().optional().nullable().or(z.literal("")),
})

export const createTareaSchema = createTareaBase.refine(
  (val) => !val.fechaLimite || isValidDateFormat(val.fechaLimite),
  { message: "Formato de fecha inválido (usá AAAA-MM-DD)", path: ["fechaLimite"] }
).refine(
  (val) => !val.fechaLimite || val.fechaLimite >= getTodayISO(),
  { message: "La fecha límite no puede ser anterior a hoy", path: ["fechaLimite"] }
)

export const updateTareaSchema = createTareaBase.partial().extend({
  estado: z.enum(ESTADOS_TAREA).optional(),
})

export type CreateTareaFormData = z.infer<typeof createTareaSchema>
export type UpdateTareaFormData = z.infer<typeof updateTareaSchema>
