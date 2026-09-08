import { describe, expect, it } from "vitest"
import { createHallazgoSchema, updateHallazgoSchema, SEVERIDADES, ESTADOS_HALLAZGO } from "./hallazgos"

describe("createHallazgoSchema", () => {
  it("acepta un hallazgo válido", () => {
    const result = createHallazgoSchema.safeParse({
      proyectoId: "p1",
      titulo: "XSS en login",
      descripcion: "Se encontró vulnerabilidad XSS en el formulario de login",
      severidad: "CRITICA",
    })
    expect(result.success).toBe(true)
  })

  it("requiere proyectoId", () => {
    const result = createHallazgoSchema.safeParse({
      titulo: "XSS",
      descripcion: "Descripción válida con más de 10 caracteres",
    })
    expect(result.success).toBe(false)
  })

  it("requiere titulo con al menos 3 caracteres", () => {
    const result = createHallazgoSchema.safeParse({
      proyectoId: "p1",
      titulo: "AB",
      descripcion: "Descripción válida con más de 10 caracteres",
    })
    expect(result.success).toBe(false)
  })

  it("rechaza titulo mayor a 200 caracteres", () => {
    const result = createHallazgoSchema.safeParse({
      proyectoId: "p1",
      titulo: "X".repeat(201),
      descripcion: "Descripción válida con más de 10 caracteres",
    })
    expect(result.success).toBe(false)
  })

  it("requiere descripcion con al menos 10 caracteres", () => {
    const result = createHallazgoSchema.safeParse({
      proyectoId: "p1",
      titulo: "XSS en login",
      descripcion: "Corto",
    })
    expect(result.success).toBe(false)
  })

  it("acepta severidad por defecto MEDIA", () => {
    const result = createHallazgoSchema.safeParse({
      proyectoId: "p1",
      titulo: "XSS en login",
      descripcion: "Descripción válida con más de 10 caracteres",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.severidad).toBe("MEDIA")
    }
  })

  it("acepta todas las severidades válidas", () => {
    for (const severidad of SEVERIDADES) {
      const result = createHallazgoSchema.safeParse({
        proyectoId: "p1",
        titulo: "Hallazgo test",
        descripcion: "Descripción válida con más de 10 caracteres",
        severidad,
      })
      expect(result.success).toBe(true)
    }
  })

  it("rechaza severidad inválida", () => {
    const result = createHallazgoSchema.safeParse({
      proyectoId: "p1",
      titulo: "XSS en login",
      descripcion: "Descripción válida con más de 10 caracteres",
      severidad: "INVALIDA",
    })
    expect(result.success).toBe(false)
  })

  it("acepta evidencia opcional", () => {
    const result = createHallazgoSchema.safeParse({
      proyectoId: "p1",
      titulo: "XSS en login",
      descripcion: "Descripción válida con más de 10 caracteres",
      evidencia: "Captura de pantalla",
    })
    expect(result.success).toBe(true)
  })

  it("acepta recomendación opcional", () => {
    const result = createHallazgoSchema.safeParse({
      proyectoId: "p1",
      titulo: "XSS en login",
      descripcion: "Descripción válida con más de 10 caracteres",
      recomendacion: "Sanitizar entradas",
    })
    expect(result.success).toBe(true)
  })
})

describe("updateHallazgoSchema", () => {
  it("acepta actualización parcial", () => {
    const result = updateHallazgoSchema.safeParse({ titulo: "Nuevo título" })
    expect(result.success).toBe(true)
  })

  it("acepta cambio de estado", () => {
    for (const estado of ESTADOS_HALLAZGO) {
      const result = updateHallazgoSchema.safeParse({ estado })
      expect(result.success).toBe(true)
    }
  })

  it("rechaza estado inválido", () => {
    const result = updateHallazgoSchema.safeParse({ estado: "INVALIDO" })
    expect(result.success).toBe(false)
  })
})
