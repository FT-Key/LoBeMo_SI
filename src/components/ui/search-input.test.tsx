import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { SearchInput } from "./search-input"

describe("SearchInput (US-052)", () => {
  it("renderiza con placeholder por defecto", () => {
    render(<SearchInput value="" onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument()
  })

  it("muestra placeholder personalizado", () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Filtrar clientes" />)
    expect(screen.getByPlaceholderText("Filtrar clientes")).toBeInTheDocument()
  })

  it("refleja el valor actual", () => {
    render(<SearchInput value="test" onChange={vi.fn()} />)
    expect(screen.getByDisplayValue("test")).toBeInTheDocument()
  })

  it("llama onChange con el valor nuevo", () => {
    const onChange = vi.fn()
    render(<SearchInput value="" onChange={onChange} />)
    fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "hola" } })
    expect(onChange).toHaveBeenCalledWith("hola")
  })

  it("llama onKeyDown al presionar una tecla", () => {
    const onKeyDown = vi.fn()
    render(<SearchInput value="" onChange={vi.fn()} onKeyDown={onKeyDown} />)
    fireEvent.keyDown(screen.getAllByRole("textbox")[0], { key: "Enter" })
    expect(onKeyDown).toHaveBeenCalled()
  })
})
