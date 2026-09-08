import { describe, expect, it } from "vitest"
import { createClienteSchema, updateClienteSchema } from "./clientes"

const valido = {
  razonSocial: "Centro Hogar SRL",
  cuit: "30-12345678-9",
}

describe("createClienteSchema", () => {
  it("acepta CUIT con guiones", () => {
    expect(createClienteSchema.safeParse(valido).success).toBe(true)
  })

  it("acepta CUIT de 11 dígitos sin guiones", () => {
    expect(createClienteSchema.safeParse({ ...valido, cuit: "30123456789" }).success).toBe(true)
  })

  it("rechaza CUIT con formato inválido", () => {
    expect(createClienteSchema.safeParse({ ...valido, cuit: "123" }).success).toBe(false)
  })

  it("rechaza razón social de menos de 3 caracteres", () => {
    expect(createClienteSchema.safeParse({ ...valido, razonSocial: "AB" }).success).toBe(false)
  })

  it("rechaza sector inválido", () => {
    expect(createClienteSchema.safeParse({ ...valido, sector: "ESPACIO" }).success).toBe(false)
  })

  it("acepta campos opcionales vacíos", () => {
    const result = createClienteSchema.safeParse({
      ...valido,
      emailContacto: "",
      telefono: "",
      direccion: "",
      sector: "",
    })
    expect(result.success).toBe(true)
  })

  it("rechaza email de contacto inválido", () => {
    const result = createClienteSchema.safeParse({ ...valido, emailContacto: "no-email" })
    expect(result.success).toBe(false)
  })
})

describe("updateClienteSchema", () => {
  it("acepta actualización parcial", () => {
    expect(updateClienteSchema.safeParse({ telefono: "381-555-1234" }).success).toBe(true)
  })

  it("rechaza CUIT inválido en actualización parcial", () => {
    expect(updateClienteSchema.safeParse({ cuit: "mal" }).success).toBe(false)
  })
})
