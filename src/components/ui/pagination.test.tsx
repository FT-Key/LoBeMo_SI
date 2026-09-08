import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Pagination, initialPagination } from "./pagination"

describe("initialPagination (US-052)", () => {
  it("devuelve page=1 con valores por defecto", () => {
    const p = initialPagination()
    expect(p).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 })
  })

  it("calcula totalPages correctamente", () => {
    const p = initialPagination(10, 35)
    expect(p.totalPages).toBe(4)
  })

  it("limit personalizado", () => {
    const p = initialPagination(25, 100)
    expect(p).toEqual({ page: 1, limit: 25, total: 100, totalPages: 4 })
  })
})

describe("Pagination component (US-052)", () => {
  it("no renderiza si totalPages <= 1", () => {
    const { container } = render(
      <Pagination
        pagination={{ page: 1, limit: 10, total: 5, totalPages: 1 }}
        onPageChange={vi.fn()}
      />
    )
    expect(container.innerHTML).toBe("")
  })

  it("muestra rango de elementos y total", () => {
    render(
      <Pagination
        pagination={{ page: 2, limit: 10, total: 25, totalPages: 3 }}
        onPageChange={vi.fn()}
      />
    )
    expect(screen.getByText(/Mostrando 11–20 de 25/)).toBeInTheDocument()
  })

  it("llama onPageChange con página anterior", () => {
    const onChange = vi.fn()
    render(
      <Pagination
        pagination={{ page: 2, limit: 10, total: 25, totalPages: 3 }}
        onPageChange={onChange}
      />
    )
    fireEvent.click(screen.getAllByText("Anterior")[0])
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it("llama onPageChange con página siguiente", () => {
    const onChange = vi.fn()
    render(
      <Pagination
        pagination={{ page: 2, limit: 10, total: 25, totalPages: 3 }}
        onPageChange={onChange}
      />
    )
    fireEvent.click(screen.getAllByText("Siguiente")[0])
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it("deshabilita 'Anterior' en primera página", () => {
    render(
      <Pagination
        pagination={{ page: 1, limit: 10, total: 25, totalPages: 3 }}
        onPageChange={vi.fn()}
      />
    )
    expect(screen.getAllByText("Anterior")[0]).toBeDisabled()
  })

  it("deshabilita 'Siguiente' en última página", () => {
    render(
      <Pagination
        pagination={{ page: 3, limit: 10, total: 25, totalPages: 3 }}
        onPageChange={vi.fn()}
      />
    )
    expect(screen.getAllByText("Siguiente")[0]).toBeDisabled()
  })
})
