import { describe, expect, it } from "vitest"
import {
  createProyectoSchema,
  portalAccesoSchema,
  portalCambioClaveSchema,
  transicionEstadoSchema,
} from "./proyectos"

const valido = {
  nombre: "Seguridad Integral Centro Hogar",
  clienteId: "cli-1",
  servicioId: "srv-1",
}

describe("createProyectoSchema", () => {
  it("acepta un proyecto válido con opcionales vacíos", () => {
    const result = createProyectoSchema.safeParse({
      ...valido,
      descripcion: "",
      fechaEstimadaFin: "",
      montoAcordado: "",
      portalClave: "",
    })
    expect(result.success).toBe(true)
  })

  it("rechaza nombre de menos de 3 caracteres", () => {
    expect(createProyectoSchema.safeParse({ ...valido, nombre: "AB" }).success).toBe(false)
  })

  it("rechaza clave de portal de menos de 6 caracteres", () => {
    expect(createProyectoSchema.safeParse({ ...valido, portalClave: "12345" }).success).toBe(false)
  })

  it("rechaza sin clienteId", () => {
    expect(createProyectoSchema.safeParse({ ...valido, clienteId: "" }).success).toBe(false)
  })
})

describe("transicionEstadoSchema", () => {
  it("acepta un estado válido", () => {
    expect(transicionEstadoSchema.safeParse({ nuevoEstado: "APROBADO" }).success).toBe(true)
  })

  it("rechaza un estado inválido", () => {
    expect(transicionEstadoSchema.safeParse({ nuevoEstado: "ARCHIVADO" }).success).toBe(false)
  })
})

describe("portalAccesoSchema", () => {
  it("acepta acceso con código y clave", () => {
    expect(portalAccesoSchema.safeParse({ codigo: "LBM-AUDI-AB12", clave: "secreta" }).success).toBe(true)
  })

  it("rechaza sin código ni proyectoId", () => {
    expect(portalAccesoSchema.safeParse({ clave: "secreta" }).success).toBe(false)
  })
})

describe("portalCambioClaveSchema", () => {
  it("rechaza nueva clave de menos de 6 caracteres", () => {
    const result = portalCambioClaveSchema.safeParse({ claveActual: "a", nuevaClave: "12345" })
    expect(result.success).toBe(false)
  })
})
