import { describe, expect, it } from "vitest"
import { propuestaEmail } from "./propuesta-email"

describe("propuestaEmail", () => {
  const base = {
    nombreCliente: "Centro Hogar S.A.",
    nombreProyecto: "Auditoría Seguridad 2026",
    servicio: "AUDITORIA_ISO27001",
    montoTotal: 1500000,
    fechaVencimiento: "2026-10-15T12:00:00.000Z",
    detalleServicios: null as null | Array<{ concepto: string; monto: number }>,
    portalUrl: "https://app.lobemo.com/propuestas/p1",
  }

  it("contiene el nombre del cliente", () => {
    const html = propuestaEmail(base)
    expect(html).toContain("Centro Hogar S.A.")
  })

  it("contiene el nombre del proyecto", () => {
    const html = propuestaEmail(base)
    expect(html).toContain("Auditoría Seguridad 2026")
  })

  it("formatea el monto total en ARS", () => {
    const html = propuestaEmail(base)
    expect(html).toContain("ARS")
    expect(html).toContain("1.500.000")
  })

  it("incluye la fecha de vencimiento formateada", () => {
    const html = propuestaEmail(base)
    expect(html).toContain("Vencimiento")
    expect(html).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it("incluye el botón de ver propuesta", () => {
    const html = propuestaEmail(base)
    expect(html).toContain("Ver propuesta completa")
    expect(html).toContain("https://app.lobemo.com/propuestas/p1")
  })

  it("muestra detalle de servicios cuando se provee", () => {
    const html = propuestaEmail({
      ...base,
      detalleServicios: [
        { concepto: "Auditoría ISO 27001", monto: 1000000 },
        { concepto: "Reporte ejecutivo", monto: 500000 },
      ],
    })
    expect(html).toContain("Detalle de servicios")
    expect(html).toContain("Auditoría ISO 27001")
    expect(html).toContain("Reporte ejecutivo")
    expect(html).toContain("1.000.000")
    expect(html).toContain("500.000")
  })

  it("no muestra tabla de detalle cuando es null", () => {
    const html = propuestaEmail({ ...base, detalleServicios: null })
    expect(html).not.toContain("Detalle de servicios")
  })

  it("reemplaza guiones bajos del servicio por espacios", () => {
    const html = propuestaEmail(base)
    expect(html).toContain("AUDITORIA ISO27001")
  })

  it("incluye el logo cuando se provee logoCid", () => {
    const html = propuestaEmail({ ...base, logoCid: "logo@lobemo" })
    expect(html).toContain("cid:logo@lobemo")
  })

  it("genera HTML válido conDOCTYPE", () => {
    const html = propuestaEmail(base)
    expect(html).toContain("<!DOCTYPE html>")
    expect(html).toContain("</html>")
  })
})
