import { describe, expect, it } from "vitest"
import { cn } from "./utils"

describe("cn", () => {
  it("combina clases simples", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("ignora valores falsy", () => {
    expect(cn("px-4", false, undefined, null, "py-2")).toBe("px-4 py-2")
  })

  it("resuelve conflictos de tailwind con la última clase", () => {
    expect(cn("px-4", "px-8")).toBe("px-8")
  })

  it("soporta objetos condicionales", () => {
    expect(cn("base", { activo: true, oculto: false })).toBe("base activo")
  })

  it("soporta arrays anidados", () => {
    expect(cn(["a", ["b", "c"]])).toBe("a b c")
  })
})
