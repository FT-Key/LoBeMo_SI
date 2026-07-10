import { z } from "zod"

export const PRIORIDADES = ["BAJA", "MEDIA", "ALTA", "CRITICA"] as const
export const CATEGORIAS = ["INCIDENTE", "CONSULTA", "SOLICITUD"] as const
export const ESTADOS_TICKET = ["ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"] as const

export const createTicketSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100, "El título no puede exceder 100 caracteres"),
  descripcion: z.string().max(1000, "La descripción no puede exceder 1000 caracteres").optional().or(z.literal("")),
  prioridad: z.enum(PRIORIDADES).default("MEDIA"),
  categoria: z.enum(CATEGORIAS).default("CONSULTA"),
  clienteNombre: z.string().max(100, "El nombre del cliente no puede exceder 100 caracteres").optional().or(z.literal("")),
  proyectoId: z.string().optional().or(z.literal("")),
  asignadoAId: z.string().optional().or(z.literal("")),
})

export const updateTicketSchema = createTicketSchema.partial().extend({
  estado: z.enum(ESTADOS_TICKET).optional(),
})

export type CreateTicketFormData = z.infer<typeof createTicketSchema>
export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>
