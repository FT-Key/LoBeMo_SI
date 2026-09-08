import { describe, expect, it } from "vitest"
import { createPropuestaSchema, updatePropuestaSchema, ESTADOS_PROPUESTA } from "./propuestas"

describe("createPropuestaSchema", () => {
  it("acepta una propuesta válida", () => {
    const result = createPropuestaSchema.safeParse({
      proyectoId: "p1",
      montoTotal: 1500000,
      fechaEmision: "2026-09-01",
      fechaVencimiento: "2026-10-01",
    })
    expect(result.success).toBe(true)
  })

  it("requiere proyectoId", () => {
    const result = createPropuestaSchema.safeParse({
      montoTotal: 1500000,
      fechaEmision: "2026-09-01",
      fechaVencimiento: "2026-10-01",
    })
    expect(result.success).toBe(false)
  })

  it("requiere montoTotal positivo", () => {
    const result = createPropuestaSchema.safeParse({
      proyectoId: "p1",
      montoTotal: -100,
      fechaEmision: "2026-09-01",
      fechaVencimiento: "2026-10-01",
    })
    expect(result.success).toBe(false)
  })

  it("rechaza montoTotal cero", () => {
    const result = createPropuestaSchema.safeParse({
      proyectoId: "p1",
      montoTotal: 0,
      fechaEmision: "2026-09-01",
      fechaVencimiento: "2026-10-01",
    })
    expect(result.success).toBe(false)
  })

  it("requiere fechaEmision", () => {
    const result = createPropuestaSchema.safeParse({
      proyectoId: "p1",
      montoTotal: 1500000,
      fechaVencimiento: "2026-10-01",
    })
    expect(result.success).toBe(false)
  })

  it("requiere fechaVencimiento", () => {
    const result = createPropuestaSchema.safeParse({
      proyectoId: "p1",
      montoTotal: 1500000,
      fechaEmision: "2026-09-01",
    })
    expect(result.success).toBe(false)
  })

  it("acepta detalleServicios opcional", () => {
    const result = createPropuestaSchema.safeParse({
      proyectoId: "p1",
      montoTotal: 1500000,
      fechaEmision: "2026-09-01",
      fechaVencimiento: "2026-10-01",
      detalleServicios: [
        { concepto: "Auditoría", monto: 1000000 },
        { concepto: "Reporte", monto: 500000 },
      ],
    })
    expect(result.success).toBe(true)
  })

  it("rechaza detalleServicios con monto negativo", () => {
    const result = createPropuestaSchema.safeParse({
      proyectoId: "p1",
      montoTotal: 1500000,
      fechaEmision: "2026-09-01",
      fechaVencimiento: "2026-10-01",
      detalleServicios: [
        { concepto: "Auditoría", monto: -100 },
      ],
    })
    expect(result.success).toBe(false)
  })

  it("rechaza detalleServicios con concepto vacío", () => {
    const result = createPropuestaSchema.safeParse({
      proyectoId: "p1",
      montoTotal: 1500000,
      fechaEmision: "2026-09-01",
      fechaVencimiento: "2026-10-01",
      detalleServicios: [
        { concepto: "", monto: 1000000 },
      ],
    })
    expect(result.success).toBe(false)
  })
})

describe("updatePropuestaSchema", () => {
  it("acepta cambio de estado", () => {
    for (const estado of ESTADOS_PROPUESTA) {
      const result = updatePropuestaSchema.safeParse({ estado })
      expect(result.success).toBe(true)
    }
  })

  it("rechaza estado inválido", () => {
    const result = updatePropuestaSchema.safeParse({ estado: "INVALIDO" })
    expect(result.success).toBe(false)
  })
})
