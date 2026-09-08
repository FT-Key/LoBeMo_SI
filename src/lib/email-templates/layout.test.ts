import { describe, expect, it } from "vitest"
import {
  emailButton,
  emailCard,
  emailField,
  emailHeader,
  emailLabel,
  emailLayout,
} from "./layout"

describe("emailLayout", () => {
  it("incluye título y contenido", () => {
    const html = emailLayout({ title: "Hola", content: "<p>Cuerpo</p>" })
    expect(html).toContain("Hola")
    expect(html).toContain("<p>Cuerpo</p>")
  })

  it("incluye subtítulo cuando se provee", () => {
    const html = emailLayout({ title: "T", subtitle: "Sub", content: "C" })
    expect(html).toContain("Sub")
  })

  it("omite el subtítulo cuando no se provee", () => {
    const html = emailLayout({ title: "T", content: "C" })
    expect(html).not.toContain("94a3b8;font-size:14px;margin:0 0 24px")
  })

  it("usa footer por defecto de LoBeMo", () => {
    const html = emailLayout({ title: "T", content: "C" })
    expect(html).toContain("LoBeMo Seguridad Informática")
  })

  it("usa footer personalizado y logo cuando se proveen", () => {
    const html = emailLayout({
      title: "T",
      content: "C",
      footer: "Pie personalizado",
      logoCid: "logo",
    })
    expect(html).toContain("Pie personalizado")
    expect(html).toContain("cid:logo")
  })
})

describe("emailHeader", () => {
  it("renderiza heading y fecha en variante gradient", () => {
    const html = emailHeader({ gradient: true, heading: "Nuevo proyecto", fecha: "08/09/2026" })
    expect(html).toContain("Nuevo proyecto")
    expect(html).toContain("08/09/2026")
  })

  it("devuelve vacío sin gradient", () => {
    expect(emailHeader({ heading: "X" })).toBe("")
  })
})

describe("emailCard", () => {
  it("envuelve el contenido en un contenedor", () => {
    expect(emailCard("hola")).toContain("hola")
  })
})

describe("emailField", () => {
  it("incluye label y valor", () => {
    const html = emailField("Cliente", "Centro Hogar")
    expect(html).toContain("Cliente")
    expect(html).toContain("Centro Hogar")
  })

  it("renderiza enlace cuando isLink es true", () => {
    const html = emailField("Portal", "Abrir", { isLink: true, href: "https://x.test" })
    expect(html).toContain('<a href="https://x.test"')
  })
})

describe("emailButton", () => {
  it("incluye texto y href", () => {
    const html = emailButton("Ver proyecto", "https://x.test/p/1")
    expect(html).toContain("Ver proyecto")
    expect(html).toContain("https://x.test/p/1")
  })
})

describe("emailLabel", () => {
  it("incluye el texto", () => {
    expect(emailLabel("Estado")).toContain("Estado")
  })
})
