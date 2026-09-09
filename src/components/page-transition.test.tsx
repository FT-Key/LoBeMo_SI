import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import React from "react"

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/dashboard"),
}))

let reducedMotion = false

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
  useReducedMotion: () => reducedMotion,
}))

import { PageTransition } from "./page-transition"

describe("PageTransition (US-048)", () => {
  it("renderiza children dentro de motion.div", () => {
    render(
      <PageTransition>
        <p>Contenido</p>
      </PageTransition>
    )
    expect(screen.getByTestId("motion-div")).toBeInTheDocument()
    expect(screen.getByText("Contenido")).toBeInTheDocument()
  })

  it("pasa initial y animate al motion.div", () => {
    render(
      <PageTransition>
        <p>Test</p>
      </PageTransition>
    )
    const motionDiv = screen.getByTestId("motion-div")
    expect(motionDiv).toHaveAttribute("initial")
    expect(motionDiv).toHaveAttribute("animate")
  })

  it("respeta reducedMotion y renderiza sin animación", () => {
    reducedMotion = true

    render(
      <PageTransition>
        <p>Sin animación</p>
      </PageTransition>
    )
    expect(screen.queryByTestId("motion-div")).not.toBeInTheDocument()
    expect(screen.getByText("Sin animación")).toBeInTheDocument()

    reducedMotion = false
  })
})
