import { z } from "zod"

export const TIPOS_DOCUMENTO = [
  "INFORME", "CONTRATO", "PROPUESTA", "CERTIFICADO",
  "MANUAL", "PLANTILLA", "OTRO",
] as const

export const createDocumentoSchema = z.object({
  proyectoId: z.string().min(1, "Debe seleccionar un proyecto"),
  nombreArchivo: z.string().min(1, "El nombre del archivo es obligatorio").max(255, "El nombre no puede exceder 255 caracteres"),
  tipo: z.enum(TIPOS_DOCUMENTO),
  storageKey: z.string().min(1, "El archivo debe ser subido primero"),
  mimeType: z.string().optional(),
  tamanio: z.number().optional(),
  tareaId: z.string().optional().or(z.literal("")),
})

export const createDocumentoBase64Schema = z.object({
  proyectoId: z.string().min(1, "Debe seleccionar un proyecto"),
  nombreArchivo: z.string().min(1, "El nombre del archivo es obligatorio").max(255, "El nombre no puede exceder 255 caracteres"),
  tipo: z.enum(TIPOS_DOCUMENTO),
  url: z.string().min(1, "URL es obligatoria"),
  tareaId: z.string().optional().or(z.literal("")),
})

export const updateDocumentoSchema = createDocumentoSchema.partial()

export type CreateDocumentoFormData = z.infer<typeof createDocumentoSchema>
export type UpdateDocumentoFormData = z.infer<typeof updateDocumentoSchema>
