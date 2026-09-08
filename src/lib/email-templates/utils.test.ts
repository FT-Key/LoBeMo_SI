import { describe, expect, it, vi, beforeEach } from "vitest"
import { resolverDestinatario } from "./utils"

describe("resolverDestinatario", () => {
  const ORIGINAL = process.env.SMTP_REDIRECT_TO

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("devuelve el email original cuando no hay redirect configurado", () => {
    delete process.env.SMTP_REDIRECT_TO
    expect(resolverDestinatario("test@lobemo.com")).toBe("test@lobemo.com")
  })

  it("devuelve el email original cuando no es del dominio lobemo", () => {
    process.env.SMTP_REDIRECT_TO = "dev@lobemo.com"
    expect(resolverDestinatario("user@otro.com")).toBe("user@otro.com")
  })

  it("redirige emails del dominio lobemo cuando SMTP_REDIRECT_TO está seteado", () => {
    process.env.SMTP_REDIRECT_TO = "dev@lobemo.com"
    expect(resolverDestinatario("empleado@lobemo.com")).toBe("dev@lobemo.com")
  })

  it("es case-insensitive para el dominio", () => {
    process.env.SMTP_REDIRECT_TO = "dev@lobemo.com"
    expect(resolverDestinatario("empleado@LOBEMO.COM")).toBe("dev@lobemo.com")
  })

  it("no redirige emails de otros dominios aunque tengan lobemo en el nombre", () => {
    process.env.SMTP_REDIRECT_TO = "dev@lobemo.com"
    expect(resolverDestinatario("user@nolobemo.com")).toBe("user@nolobemo.com")
  })
})
