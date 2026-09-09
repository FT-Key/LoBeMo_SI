import { describe, it, expect } from "vitest"
import {
  createDocumentoSchema,
  createDocumentoBase64Schema,
  updateDocumentoSchema,
  TIPOS_DOCUMENTO,
} from "./documentos"

const validBase = {
  proyectoId: "proj-1",
  nombreArchivo: "informe.pdf",
  tipo: "INFORME" as const,
}

describe("documentos schema (US-052)", () => {
  describe("createDocumentoSchema", () => {
    it("acepta documento válido con storageKey", () => {
      const result = createDocumentoSchema.safeParse({
        ...validBase,
        storageKey: "uploads/doc.pdf",
      })
      expect(result.success).toBe(true)
    })

    it("rechaza proyectoId vacío", () => {
      const result = createDocumentoSchema.safeParse({
        ...validBase,
        proyectoId: "",
        storageKey: "key",
      })
      expect(result.success).toBe(false)
    })

    it("rechaza nombreArchivo vacío", () => {
      const result = createDocumentoSchema.safeParse({
        ...validBase,
        nombreArchivo: "",
        storageKey: "key",
      })
      expect(result.success).toBe(false)
    })

    it("rechaza nombreArchivo > 255 caracteres", () => {
      const result = createDocumentoSchema.safeParse({
        ...validBase,
        nombreArchivo: "a".repeat(256),
        storageKey: "key",
      })
      expect(result.success).toBe(false)
    })

    it("rechaza storageKey vacío", () => {
      const result = createDocumentoSchema.safeParse({
        ...validBase,
        storageKey: "",
      })
      expect(result.success).toBe(false)
    })

    it("rechaza tipo inválido", () => {
      const result = createDocumentoSchema.safeParse({
        ...validBase,
        tipo: "INVALIDO",
        storageKey: "key",
      })
      expect(result.success).toBe(false)
    })

    it("acepta tareaId opcional", () => {
      const result = createDocumentoSchema.safeParse({
        ...validBase,
        storageKey: "key",
        tareaId: "task-1",
      })
      expect(result.success).toBe(true)
    })

    it("acepta tareaId vacío (string literal)", () => {
      const result = createDocumentoSchema.safeParse({
        ...validBase,
        storageKey: "key",
        tareaId: "",
      })
      expect(result.success).toBe(true)
    })

    it("acepta todos los tipos de documento válidos", () => {
      for (const tipo of TIPOS_DOCUMENTO) {
        const result = createDocumentoSchema.safeParse({
          ...validBase,
          tipo,
          storageKey: "key",
        })
        expect(result.success).toBe(true)
      }
    })
  })

  describe("createDocumentoBase64Schema", () => {
    it("acepta documento con url", () => {
      const result = createDocumentoBase64Schema.safeParse({
        ...validBase,
        url: "data:application/pdf;base64,abc123",
      })
      expect(result.success).toBe(true)
    })

    it("rechaza url vacía", () => {
      const result = createDocumentoBase64Schema.safeParse({
        ...validBase,
        url: "",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("updateDocumentoSchema", () => {
    it("acepta actualización parcial", () => {
      const result = updateDocumentoSchema.safeParse({
        nombreArchivo: "nuevo-nombre.pdf",
      })
      expect(result.success).toBe(true)
    })

    it("acepta objeto vacío (sin cambios)", () => {
      const result = updateDocumentoSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })
})
