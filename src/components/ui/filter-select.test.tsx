import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { FilterSelect } from "./filter-select"

describe("FilterSelect (US-052)", () => {
  const options = [
    { value: "activos", label: "Activos" },
    { value: "inactivos", label: "Inactivos" },
  ]

  it("renderiza opción 'Todos' por defecto", () => {
    render(<FilterSelect value="" onChange={vi.fn()} options={options} />)
    expect(screen.getAllByText("Todos")[0]).toBeInTheDocument()
  })

  it("muestra allLabel personalizado", () => {
    render(<FilterSelect value="" onChange={vi.fn()} options={options} allLabel="Todos los estados" />)
    expect(screen.getAllByText("Todos los estados")[0]).toBeInTheDocument()
  })

  it("renderiza todas las opciones", () => {
    render(<FilterSelect value="" onChange={vi.fn()} options={options} />)
    expect(screen.getAllByText("Activos").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Inactivos").length).toBeGreaterThan(0)
  })

  it("refleja el valor seleccionado", () => {
    render(<FilterSelect value="activos" onChange={vi.fn()} options={options} />)
    const select = screen.getAllByRole("combobox")[0]
    expect(select).toHaveValue("activos")
  })

  it("llama onChange al cambiar selección", () => {
    const onChange = vi.fn()
    render(<FilterSelect value="" onChange={onChange} options={options} />)
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "inactivos" } })
    expect(onChange).toHaveBeenCalledWith("inactivos")
  })
})
