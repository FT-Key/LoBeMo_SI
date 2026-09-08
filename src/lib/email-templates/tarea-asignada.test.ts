import { describe, expect, it } from "vitest"
import { tareaAsignada } from "./tarea-asignada"

describe("tareaAsignada", () => {
  const base = {
    nombreEmpleado: "María López",
    tituloTarea: "Configurar firewall",
    nombreProyecto: "Hardening Servidores",
    prioridad: "ALTA",
  }

  it("contiene el nombre del empleado", () => {
    const html = tareaAsignada(base)
    expect(html).toContain("María López")
  })

  it("contiene el título de la tarea", () => {
    const html = tareaAsignada(base)
    expect(html).toContain("Configurar firewall")
  })

  it("contiene el nombre del proyecto", () => {
    const html = tareaAsignada(base)
    expect(html).toContain("Hardening Servidores")
  })

  it("muestra la prioridad con color correspondiente", () => {
    const html = tareaAsignada(base)
    expect(html).toContain("ALTA")
    expect(html).toContain("#f97316")
  })

  it("muestra prioridad CRITICA en rojo", () => {
    const html = tareaAsignada({ ...base, prioridad: "CRITICA" })
    expect(html).toContain("#ef4444")
  })

  it("muestra prioridad MEDIA en amarillo", () => {
    const html = tareaAsignada({ ...base, prioridad: "MEDIA" })
    expect(html).toContain("#eab308")
  })

  it("muestra prioridad BAJA en verde", () => {
    const html = tareaAsignada({ ...base, prioridad: "BAJA" })
    expect(html).toContain("#22c55e")
  })

  it("muestra fecha límite cuando se provee", () => {
    const html = tareaAsignada({ ...base, fechaLimite: "20/09/2026" })
    expect(html).toContain("Fecha límite")
    expect(html).toContain("20/09/2026")
  })

  it("no muestra fecha límite cuando no se provee", () => {
    const html = tareaAsignada(base)
    expect(html).not.toContain("Fecha límite")
  })

  it("incluye botón de ver tarea cuando se provee portalUrl", () => {
    const html = tareaAsignada({ ...base, portalUrl: "https://app.lobemo.com/tareas/t1" })
    expect(html).toContain("Ver tarea")
    expect(html).toContain("https://app.lobemo.com/tareas/t1")
  })

  it("no incluye botón cuando no se provee portalUrl", () => {
    const html = tareaAsignada(base)
    expect(html).not.toContain("Ver tarea")
  })
})
