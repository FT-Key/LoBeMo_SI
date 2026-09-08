import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

const mockSetTheme = vi.fn()
let currentTheme = "dark"

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: currentTheme, setTheme: mockSetTheme }),
}))

vi.mock("react", async () => {
  const actual = await vi.importActual("react")
  return {
    ...actual,
    useSyncExternalStore: vi.fn().mockReturnValue(true),
  }
})

import { ThemeToggle } from "./theme-toggle"

describe("ThemeToggle (US-047)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentTheme = "dark"
  })

  it("muestra 'Modo claro' cuando el tema es dark", () => {
    render(<ThemeToggle />)
    expect(screen.getByText("Modo claro")).toBeInTheDocument()
  })

  it("muestra 'Modo oscuro' cuando el tema es light", () => {
    currentTheme = "light"
    render(<ThemeToggle />)
    expect(screen.getByText("Modo oscuro")).toBeInTheDocument()
  })

  it("alterna entre dark y light al hacer click", () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole("button"))
    expect(mockSetTheme).toHaveBeenCalledWith("light")
  })

  it("oculta el texto en modo collapsed", () => {
    render(<ThemeToggle collapsed />)
    expect(screen.queryByText("Modo claro")).not.toBeInTheDocument()
  })

  it("tiene aria-label descriptivo", () => {
    render(<ThemeToggle />)
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Cambiar a modo claro"
    )
  })
})
