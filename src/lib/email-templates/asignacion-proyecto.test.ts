import { describe, expect, it } from "vitest"
import { asignacionProyecto } from "./asignacion-proyecto"

describe("asignacionProyecto", () => {
  const base = {
    nombreEmpleado: "Juan Pérez",
    nombreProyecto: "Pentesting Banco Nación",
    rolEnProyecto: "PENTESTER",
    estadoProyecto: "EN_EJECUCION",
  }

  it("contiene el nombre del empleado", () => {
    const html = asignacionProyecto(base)
    expect(html).toContain("Juan Pérez")
  })

  it("contiene el nombre del proyecto", () => {
    const html = asignacionProyecto(base)
    expect(html).toContain("Pentesting Banco Nación")
  })

  it("muestra el rol del empleado", () => {
    const html = asignacionProyecto(base)
    expect(html).toContain("Tu rol")
    expect(html).toContain("PENTESTER")
  })

  it("muestra el estado del proyecto", () => {
    const html = asignacionProyecto(base)
    expect(html).toContain("Estado")
    expect(html).toContain("EN_EJECUCION")
  })

  it("incluye botón de ver proyecto cuando se provee portalUrl", () => {
    const html = asignacionProyecto({ ...base, portalUrl: "https://app.lobemo.com/proyectos/p1" })
    expect(html).toContain("Ver proyecto")
    expect(html).toContain("https://app.lobemo.com/proyectos/p1")
  })

  it("no incluye botón cuando no se provee portalUrl", () => {
    const html = asignacionProyecto(base)
    expect(html).not.toContain("Ver proyecto")
  })

  it("incluye el logo cuando se provee logoCid", () => {
    const html = asignacionProyecto({ ...base, logoCid: "logo@lobemo" })
    expect(html).toContain("cid:logo@lobemo")
  })
})
