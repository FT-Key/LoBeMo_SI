import { describe, expect, it } from "vitest"
import { resolverDestinatario } from "@/lib/email"

describe("resolverDestinatario (email.ts)", () => {
  it("devuelve el email original cuando no hay redirect", () => {
    delete process.env.SMTP_REDIRECT_TO
    expect(resolverDestinatario("test@lobemo.com")).toBe("test@lobemo.com")
  })

  it("redirige emails del dominio lobemo cuando hay redirect", () => {
    process.env.SMTP_REDIRECT_TO = "dev@lobemo.com"
    expect(resolverDestinatario("empleado@lobemo.com")).toBe("dev@lobemo.com")
  })

  it("no redirige emails de otros dominios", () => {
    process.env.SMTP_REDIRECT_TO = "dev@lobemo.com"
    expect(resolverDestinatario("user@otro.com")).toBe("user@otro.com")
  })
})
