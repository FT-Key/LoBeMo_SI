import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/prisma", () => ({
  prisma: {
    proyecto: {
      findUnique: vi.fn(),
    },
  },
}))

import type { Proyecto } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { formatCodigoDisplay, generarCodigoProyecto } from "./proyecto-codigo"

const existente = { id: "1" } as unknown as Proyecto

const findUnique = vi.mocked(prisma.proyecto.findUnique)

beforeEach(() => {
  vi.resetAllMocks()
})

describe("generarCodigoProyecto", () => {
  it("genera un código con formato LBM-XXXX-XXXX", async () => {
    findUnique.mockResolvedValue(null)
    const codigo = await generarCodigoProyecto("Auditoría ISO 27001")
    expect(codigo).toMatch(/^LBM-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
  })

  it("deriva el prefijo del nombre sin acentos", async () => {
    findUnique.mockResolvedValue(null)
    const codigo = await generarCodigoProyecto("Áuditoría de redes")
    expect(codigo.startsWith("LBM-AUDI-")).toBe(true)
  })

  it("reintenta cuando el código ya existe", async () => {
    findUnique.mockResolvedValueOnce(existente).mockResolvedValueOnce(null)
    const codigo = await generarCodigoProyecto("Pentesting")
    expect(codigo).toMatch(/^LBM-PENT-[A-Z0-9]{4}$/)
    expect(findUnique).toHaveBeenCalledTimes(2)
  })

  it("lanza error si no logra un código único en 10 intentos", async () => {
    findUnique.mockResolvedValue(existente)
    await expect(generarCodigoProyecto("Soporte")).rejects.toThrow(
      "No se pudo generar un código único"
    )
    expect(findUnique).toHaveBeenCalledTimes(10)
  })
})

describe("formatCodigoDisplay", () => {
  it("devuelve el código sin modificar", () => {
    expect(formatCodigoDisplay("LBM-AUDI-AB12")).toBe("LBM-AUDI-AB12")
  })
})
