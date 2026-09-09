import { z } from "zod"

export const createServicioSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional().or(z.literal("")),
  precioBase: z.number().positive("El precio debe ser mayor a 0").optional().nullable(),
})

export type CreateServicioFormData = z.infer<typeof createServicioSchema>
