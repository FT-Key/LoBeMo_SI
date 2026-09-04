import { z } from "zod"

export const SERVICIOS_CONTACTO = [
  "AUDITORIA_SEGURIDAD",
  "PENTESTING",
  "HARDENING",
  "ANALISIS_FORENSE",
  "CAPACITACIONES",
  "CONSULTORIA",
  "OTRO",
] as const

export const createContactoSchema = z.object({
  nombre: z
    .string()
    .min(1, "Ingresá tu nombre")
    .max(80, "El nombre es demasiado largo"),
  email: z
    .string()
    .min(1, "Ingresá tu email")
    .email("Ingresá un email válido")
    .max(100, "El email es demasiado largo"),
  telefono: z
    .string()
    .max(20, "El teléfono es demasiado largo")
    .optional()
    .or(z.literal("")),
  servicio: z
    .enum(SERVICIOS_CONTACTO)
    .optional()
    .or(z.literal("")),
  mensaje: z
    .string()
    .min(1, "Escribí tu mensaje")
    .max(500, "El mensaje no puede superar los 500 caracteres"),
})

export type CreateContactoFormData = z.infer<typeof createContactoSchema>

export const SERVICIOS_CONTACTO_LABELS: Record<string, string> = {
  AUDITORIA_SEGURIDAD: "Auditoría de Seguridad",
  PENTESTING: "Pentesting",
  HARDENING: "Hardening de Sistemas",
  ANALISIS_FORENSE: "Análisis Forense",
  CAPACITACIONES: "Capacitaciones",
  CONSULTORIA: "Consultoría Estratégica",
  OTRO: "Otro servicio",
}
