import { z } from "zod"
import { getTodayISO, isValidDateFormat } from "@/shared/utils/date-utils"

const createHitoBase = z.object({
  proyectoId: z.string().min(1, "Debe seleccionar un proyecto"),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional().or(z.literal("")),
  fechaPrevista: z.string().min(1, "La fecha prevista es obligatoria"),
  fechaReal: z.string().optional().or(z.literal("")),
})

export const createHitoSchema = createHitoBase.refine(
  (val) => isValidDateFormat(val.fechaPrevista),
  { message: "Formato de fecha inválido (usá AAAA-MM-DD)", path: ["fechaPrevista"] }
).refine(
  (val) => val.fechaPrevista >= getTodayISO(),
  { message: "La fecha prevista no puede ser anterior a hoy", path: ["fechaPrevista"] }
)

export const updateHitoSchema = createHitoBase.partial().extend({
  completado: z.boolean().optional(),
})

export type CreateHitoFormData = z.infer<typeof createHitoSchema>
export type UpdateHitoFormData = z.infer<typeof updateHitoSchema>
