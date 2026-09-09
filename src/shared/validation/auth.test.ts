import { describe, expect, it } from "vitest"
import { loginSchema, registerSchema } from "./auth"

describe("loginSchema", () => {
  it("acepta credenciales válidas", () => {
    const result = loginSchema.safeParse({ email: "admin@lobemo.com", password: "x" })
    expect(result.success).toBe(true)
  })

  it("rechaza email inválido", () => {
    const result = loginSchema.safeParse({ email: "no-es-email", password: "x" })
    expect(result.success).toBe(false)
  })

  it("rechaza contraseña vacía", () => {
    const result = loginSchema.safeParse({ email: "admin@lobemo.com", password: "" })
    expect(result.success).toBe(false)
  })
})

describe("registerSchema", () => {
  const valido = {
    nombre: "Ana",
    apellido: "Pérez",
    email: "ana@lobemo.com",
    password: "secreta123",
  }

  it("acepta un empleado válido", () => {
    expect(registerSchema.safeParse(valido).success).toBe(true)
  })

  it("rechaza nombre de menos de 2 caracteres", () => {
    const result = registerSchema.safeParse({ ...valido, nombre: "A" })
    expect(result.success).toBe(false)
  })

  it("rechaza contraseña de menos de 6 caracteres", () => {
    const result = registerSchema.safeParse({ ...valido, password: "12345" })
    expect(result.success).toBe(false)
  })

  it("rechaza email inválido", () => {
    const result = registerSchema.safeParse({ ...valido, email: "ana" })
    expect(result.success).toBe(false)
  })
})
