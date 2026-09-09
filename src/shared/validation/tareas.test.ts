import { describe, expect, it } from "vitest"
import { createTareaSchema, updateTareaSchema } from "./tareas"

const valida = {
  proyectoId: "proy-1",
  titulo: "Revisar controles de acceso",
}

describe("createTareaSchema", () => {
  it("acepta una tarea válida y aplica prioridad MEDIA por defecto", () => {
    const result = createTareaSchema.safeParse(valida)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.prioridad).toBe("MEDIA")
  })

  it("rechaza título de menos de 3 caracteres", () => {
    expect(createTareaSchema.safeParse({ ...valida, titulo: "AB" }).success).toBe(false)
  })

  it("rechaza proyectoId vacío", () => {
    expect(createTareaSchema.safeParse({ ...valida, proyectoId: "" }).success).toBe(false)
  })

  it("rechaza prioridad inválida", () => {
    expect(createTareaSchema.safeParse({ ...valida, prioridad: "CRITICA" }).success).toBe(false)
  })

  it("acepta prioridad URGENTE", () => {
    expect(createTareaSchema.safeParse({ ...valida, prioridad: "URGENTE" }).success).toBe(true)
  })
})

describe("updateTareaSchema", () => {
  it("acepta cambio de estado válido", () => {
    expect(updateTareaSchema.safeParse({ estado: "COMPLETADA" }).success).toBe(true)
  })

  it("rechaza estado inválido", () => {
    expect(updateTareaSchema.safeParse({ estado: "HECHA" }).success).toBe(false)
  })
})
