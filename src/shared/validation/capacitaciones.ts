import { z } from "zod"
import { getTodayISO, isValidDateFormat } from "@/shared/utils/date-utils"

export const MODALIDADES = ["PRESENCIAL", "REMOTA"] as const
export const ESTADOS_CAPACITACION = ["PLANIFICADA", "EN_CURSO", "COMPLETADA", "CANCELADA"] as const

const createCapacitacionBase = z.object({
  proyectoId: z.string().optional().or(z.literal("")),
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100, "El título no puede exceder 100 caracteres"),
  temario: z.string().min(10, "El temario debe tener al menos 10 caracteres").max(2000, "El temario no puede exceder 2000 caracteres"),
  duracionHoras: z.number().int().min(1, "La duración debe ser al menos 1 hora").max(999, "La duración no puede exceder 999 horas"),
  modalidad: z.enum(MODALIDADES).default("PRESENCIAL"),
  fechaInicio: z.string().min(1, "La fecha de inicio es obligatoria").refine(
    (val) => isValidDateFormat(val),
    { message: "Formato de fecha inválido (usá AAAA-MM-DD)" }
  ),
  fechaFin: z.string().optional().or(z.literal("")).refine(
    (val) => !val || isValidDateFormat(val),
    { message: "Formato de fecha inválido (usá AAAA-MM-DD)" }
  ),
  materiales: z.string().max(2000, "Los materiales no pueden exceder 2000 caracteres").optional().or(z.literal("")),
})

export const createCapacitacionSchema = createCapacitacionBase.refine(
  (data) => !data.fechaFin || data.fechaFin >= data.fechaInicio,
  { message: "La fecha de fin no puede ser anterior a la fecha de inicio", path: ["fechaFin"] }
)

export const updateCapacitacionSchema = createCapacitacionBase.partial().extend({
  estado: z.enum(ESTADOS_CAPACITACION).optional(),
})

export type CreateCapacitacionFormData = z.infer<typeof createCapacitacionSchema>
export type UpdateCapacitacionFormData = z.infer<typeof updateCapacitacionSchema>
