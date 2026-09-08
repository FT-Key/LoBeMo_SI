import { describe, expect, it } from "vitest"

describe("email-templates - templates adicionales", () => {
  it("credenciales template genera HTML con credenciales", async () => {
    const { credenciales } = await import("./credenciales")
    const html = credenciales({
      nombreProyecto: "Auditoría 2026",
      codigo: "PRJ-001",
      clave: "Temp1234!",
      portalUrl: "https://app.lobemo.com",
    })
    expect(html).toContain("Auditoría 2026")
    expect(html).toContain("PRJ-001")
    expect(html).toContain("Temp1234!")
    expect(html).toContain("https://app.lobemo.com")
  })

  it("contactoNotificacion template genera HTML con datos del contacto", async () => {
    const { contactoNotificacion } = await import("./contacto-notificacion")
    const html = contactoNotificacion({
      nombre: "Juan Pérez",
      email: "juan@test.com",
      servicioLabel: "Pentesting",
      mensaje: "Quiero información",
      fecha: "08/09/2026",
    })
    expect(html).toContain("Juan Pérez")
    expect(html).toContain("juan@test.com")
    expect(html).toContain("Pentesting")
    expect(html).toContain("Quiero información")
  })

  it("contactoConfirmacion template genera HTML de confirmación", async () => {
    const { contactoConfirmacion } = await import("./contacto-confirmacion")
    const html = contactoConfirmacion({ nombre: "Juan Pérez", mensaje: "Mi consulta" })
    expect(html).toContain("Juan Pérez")
    expect(html).toContain("Mi consulta")
  })

  it("portalBienvenida template genera HTML de bienvenida", async () => {
    const { portalBienvenida } = await import("./portal-bienvenida")
    const html = portalBienvenida({
      nombreProyecto: "Auditoría 2026",
      codigo: "PRJ-001",
      clave: "pass123",
      portalUrl: "https://portal.lobemo.com/p1",
    })
    expect(html).toContain("Auditoría 2026")
    expect(html).toContain("PRJ-001")
    expect(html).toContain("https://portal.lobemo.com/p1")
  })

  it("portalActivacion template genera HTML de activación", async () => {
    const { portalActivacion } = await import("./portal-activacion")
    const html = portalActivacion({
      nombreProyecto: "Auditoría 2026",
      codigo: "PRJ-001",
      clave: "pass123",
      portalUrl: "https://portal.lobemo.com/activate/tok",
      titulo: "Portal activado",
      subtitulo: "Tu portal está listo",
    })
    expect(html).toContain("Auditoría 2026")
    expect(html).toContain("PRJ-001")
    expect(html).toContain("https://portal.lobemo.com/activate/tok")
  })
})
