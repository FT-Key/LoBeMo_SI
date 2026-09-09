import { describe, expect, it } from "vitest"
import { cambioEstado } from "./cambio-estado"

describe("cambioEstado", () => {
  const base = {
    nombreProyecto: " Auditoría Redes Local",
    estadoAnterior: "EN_EJECUCION",
    nuevoEstado: "EN_REVISION",
    portalUrl: "https://app.lobemo.com/proyectos/p1",
  }

  it("contiene el nombre del proyecto", () => {
    const html = cambioEstado(base)
    expect(html).toContain(" Auditoría Redes Local")
  })

  it("muestra el estado anterior con label legible", () => {
    const html = cambioEstado(base)
    expect(html).toContain("En Ejecución")
  })

  it("muestra el nuevo estado con label legible", () => {
    const html = cambioEstado(base)
    expect(html).toContain("En Revisión")
  })

  it("muestra flecha de transición", () => {
    const html = cambioEstado(base)
    expect(html).toContain("→")
  })

  it("incluye botón de seguimiento", () => {
    const html = cambioEstado(base)
    expect(html).toContain("Ver seguimiento del proyecto")
    expect(html).toContain("https://app.lobemo.com/proyectos/p1")
  })

  it("mapea correctamente todos los estados conocidos", () => {
    const estados: Record<string, string> = {
      RELEVAMIENTO: "Relevamiento",
      PROPUESTA: "Propuesta",
      APROBADO: "Aprobado",
      EN_EJECUCION: "En Ejecución",
      EN_REVISION: "En Revisión",
      ENTREGADO: "Entregado",
      CERRADO: "Cerrado",
    }

    for (const [key, label] of Object.entries(estados)) {
      const html = cambioEstado({ ...base, estadoAnterior: key, nuevoEstado: key })
      expect(html).toContain(label)
    }
  })

  it("usa el valor raw si el estado no está en el mapa", () => {
    const html = cambioEstado({ ...base, estadoAnterior: "CUSTOM_STATE", nuevoEstado: "OTHER" })
    expect(html).toContain("CUSTOM_STATE")
    expect(html).toContain("OTHER")
  })
})
