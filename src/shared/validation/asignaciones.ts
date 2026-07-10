import { z } from "zod"

export const createAsignacionSchema = z.object({
  proyectoId: z.string().min(1, "Debe seleccionar un proyecto"),
  empleadoId: z.string().min(1, "Debe seleccionar un empleado"),
  rolEnProyecto: z.string().min(3, "El rol debe tener al menos 3 caracteres").max(50, "El rol no puede exceder 50 caracteres"),
})

export const updateAsignacionSchema = createAsignacionSchema.partial()

export type CreateAsignacionFormData = z.infer<typeof createAsignacionSchema>
export type UpdateAsignacionFormData = z.infer<typeof updateAsignacionSchema>
