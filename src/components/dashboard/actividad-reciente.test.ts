import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

function tiempoRelativo(fechaISO: string): string {
  const ahora = Date.now()
  const fecha = new Date(fechaISO).getTime()
  const diffMs = Math.max(0, ahora - fecha)
  const minutos = Math.floor(diffMs / 60000)
  if (minutos < 1) return "ahora mismo"
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.floor(horas / 24)
  if (dias < 30) return `hace ${dias} d`
  return new Date(fechaISO).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function iniciales(nombre?: string, apellido?: string): string {
  const n = (nombre ?? "").trim().charAt(0)
  const a = (apellido ?? "").trim().charAt(0)
  return `${n}${a}`.toUpperCase() || "?"
}

describe("ActividadReciente helpers (US-049)", () => {
  describe("tiempoRelativo", () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2026-09-08T12:00:00Z"))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it("devuelve 'ahora mismo' para fechas recientes", () => {
      expect(tiempoRelativo("2026-09-08T11:59:30Z")).toBe("ahora mismo")
    })

    it("muestra minutos para < 1 hora", () => {
      expect(tiempoRelativo("2026-09-08T11:45:00Z")).toBe("hace 15 min")
    })

    it("muestra horas para < 24 horas", () => {
      expect(tiempoRelativo("2026-09-08T09:00:00Z")).toBe("hace 3 h")
    })

    it("muestra días para < 30 días", () => {
      expect(tiempoRelativo("2026-09-01T12:00:00Z")).toBe("hace 7 d")
    })

    it("muestra fecha completa para > 30 días", () => {
      const resultado = tiempoRelativo("2026-07-01T12:00:00Z")
      expect(resultado).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })
  })

  describe("iniciales", () => {
    it("devuelve iniciales de nombre y apellido", () => {
      expect(iniciales("Juan", "Pérez")).toBe("JP")
    })

    it("maneja nombre o apellido undefined", () => {
      expect(iniciales(undefined, "García")).toBe("G")
      expect(iniciales("María", undefined)).toBe("M")
    })

    it("maneja strings vacíos", () => {
      expect(iniciales("", "")).toBe("?")
    })

    it("recorta espacios en blanco", () => {
      expect(iniciales("  Carlos  ", "  López  ")).toBe("CL")
    })
  })
})
