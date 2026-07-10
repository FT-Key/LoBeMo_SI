import { z } from "zod"

export const SECTORES = [
  "SALUD", "CONTABLE_JURIDICO", "COMERCIAL", "LOGISTICA",
  "AGROINDUSTRIA", "GOBIERNO", "OTRO",
] as const

export const createClienteSchema = z.object({
  razonSocial: z.string().min(3, "La razón social debe tener al menos 3 caracteres").max(100, "La razón social no puede exceder 100 caracteres"),
  cuit: z.string().regex(/^\d{2}-\d{8}-\d{1}$|^\d{11}$/, "CUIT inválido. Formato: XX-XXXXXXXX-X o 11 dígitos"),
  emailContacto: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().max(30, "El teléfono no puede exceder 30 caracteres").optional().or(z.literal("")),
  direccion: z.string().max(200, "La dirección no puede exceder 200 caracteres").optional().or(z.literal("")),
  sector: z.enum(SECTORES).optional().or(z.literal("")),
})

export const updateClienteSchema = createClienteSchema.partial()

export type CreateClienteFormData = z.infer<typeof createClienteSchema>
export type UpdateClienteFormData = z.infer<typeof updateClienteSchema>
