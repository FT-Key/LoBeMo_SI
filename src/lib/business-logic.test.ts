import { describe, expect, it } from "vitest"

describe("lógica de comentarios - validación", () => {
  function validateComentarioContenido(contenido: unknown): { valid: boolean; error?: string } {
    if (!contenido || typeof contenido !== "string") {
      return { valid: false, error: "El contenido es requerido" }
    }
    if (contenido.trim().length === 0) {
      return { valid: false, error: "El contenido es requerido" }
    }
    if (contenido.trim().length > 2000) {
      return { valid: false, error: "El contenido debe tener máximo 2000 caracteres" }
    }
    return { valid: true }
  }

  function validateComentarioDestino(tareaId?: string, proyectoId?: string, ticketId?: string): { valid: boolean; error?: string } {
    if (!tareaId && !proyectoId && !ticketId) {
      return { valid: false, error: "Se requiere al menos un destino: tareaId, proyectoId o ticketId" }
    }
    return { valid: true }
  }

  it("rechaza contenido undefined", () => {
    expect(validateComentarioContenido(undefined).valid).toBe(false)
  })

  it("rechaza contenido vacío", () => {
    expect(validateComentarioContenido("").valid).toBe(false)
  })

  it("rechaza contenido solo espacios", () => {
    expect(validateComentarioContenido("   ").valid).toBe(false)
  })

  it("rechaza contenido mayor a 2000 caracteres", () => {
    expect(validateComentarioContenido("x".repeat(2001)).valid).toBe(false)
  })

  it("acepta contenido válido", () => {
    expect(validateComentarioContenido("Hola, este es un comentario").valid).toBe(true)
  })

  it("acepta contenido de exactamente 2000 caracteres", () => {
    expect(validateComentarioContenido("x".repeat(2000)).valid).toBe(true)
  })

  it("requiere al menos un destino", () => {
    expect(validateComentarioDestino().valid).toBe(false)
  })

  it("acepta tareaId como destino", () => {
    expect(validateComentarioDestino("t1").valid).toBe(true)
  })

  it("acepta proyectoId como destino", () => {
    expect(validateComentarioDestino(undefined, "p1").valid).toBe(true)
  })

  it("acepta ticketId como destino", () => {
    expect(validateComentarioDestino(undefined, undefined, "tk1").valid).toBe(true)
  })
})

describe("lógica de registro-horas - validación", () => {
  function validateRegistroHoras(tareaId?: string, proyectoEstado?: string): { valid: boolean; error?: string } {
    if (!tareaId) {
      return { valid: false, error: "tareaId es obligatorio" }
    }
    if (proyectoEstado === "CERRADO") {
      return { valid: false, error: "No se pueden registrar horas en tareas de proyectos cerrados" }
    }
    return { valid: true }
  }

  it("requiere tareaId", () => {
    expect(validateRegistroHoras().valid).toBe(false)
  })

  it("rechaza proyecto cerrado", () => {
    expect(validateRegistroHoras("t1", "CERRADO").valid).toBe(false)
  })

  it("acepta proyecto en ejecución", () => {
    expect(validateRegistroHoras("t1", "EN_EJECUCION").valid).toBe(true)
  })

  it("acepta proyecto en revisión", () => {
    expect(validateRegistroHoras("t1", "EN_REVISION").valid).toBe(true)
  })

  it("acepta proyecto aprobado", () => {
    expect(validateRegistroHoras("t1", "APROBADO").valid).toBe(true)
  })
})

describe("lógica de saved-filters - validación", () => {
  function validateSavedFilter(nombre?: string, modulo?: string, filtros?: unknown): { valid: boolean; error?: string } {
    if (!nombre || !modulo || !filtros) {
      return { valid: false, error: "Los campos 'nombre', 'modulo' y 'filtros' son requeridos" }
    }
    if (typeof nombre !== "string" || nombre.trim().length === 0) {
      return { valid: false, error: "El nombre debe ser un string no vacío" }
    }
    if (nombre.trim().length > 50) {
      return { valid: false, error: "El nombre debe tener máximo 50 caracteres" }
    }
    return { valid: true }
  }

  it("requiere nombre, modulo y filtros", () => {
    expect(validateSavedFilter().valid).toBe(false)
  })

  it("rechaza nombre vacío", () => {
    expect(validateSavedFilter("  ", "proyectos", {}).valid).toBe(false)
  })

  it("rechaza nombre mayor a 50 caracteres", () => {
    expect(validateSavedFilter("x".repeat(51), "proyectos", {}).valid).toBe(false)
  })

  it("acepta nombre válido de 50 caracteres", () => {
    expect(validateSavedFilter("x".repeat(50), "proyectos", {}).valid).toBe(true)
  })

  it("acepta filtro válido", () => {
    expect(validateSavedFilter("Mi Filtro", "proyectos", { estado: "EN_EJECUCION" }).valid).toBe(true)
  })
})

describe("lógica de búsqueda - construcción de queries", () => {
  function buildSearchTerm(q: string): string | null {
    const trimmed = q.trim()
    if (trimmed.length < 2) return null
    return `%${trimmed}%`
  }

  it("devuelve null para término menor a 2 caracteres", () => {
    expect(buildSearchTerm("a")).toBeNull()
  })

  it("devuelve null para string vacío", () => {
    expect(buildSearchTerm("")).toBeNull()
  })

  it("devuelve el término con wildcards para 2 caracteres", () => {
    expect(buildSearchTerm("ab")).toBe("%ab%")
  })

  it("recorta espacios extras", () => {
    expect(buildSearchTerm("  test  ")).toBe("%test%")
  })

  it("es case-sensitive en el patrón", () => {
    expect(buildSearchTerm("Test")).toBe("%Test%")
  })
})

describe("lógica de gantt - procesamiento de datos", () => {
  interface TareaGantt {
    id: string
    titulo: string
    estado: string
    createdAt: string
    fechaLimite: string | null
  }

  function calcularDuracionTarea(tarea: TareaGantt): number {
    const inicio = new Date(tarea.createdAt)
    const fin = tarea.fechaLimite ? new Date(tarea.fechaLimite) : new Date()
    return Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  }

  it("calcula duración hasta fecha límite", () => {
    const tarea: TareaGantt = {
      id: "t1",
      titulo: "Tarea 1",
      estado: "COMPLETADA",
      createdAt: "2026-09-01T00:00:00.000Z",
      fechaLimite: "2026-09-10T00:00:00.000Z",
    }
    expect(calcularDuracionTarea(tarea)).toBe(9)
  })

  it("calcula duración hasta hoy cuando no hay fecha límite", () => {
    const tarea: TareaGantt = {
      id: "t1",
      titulo: "Tarea 1",
      estado: "EN_PROGRESO",
      createdAt: "2026-09-01T00:00:00.000Z",
      fechaLimite: null,
    }
    const duracion = calcularDuracionTarea(tarea)
    expect(duracion).toBeGreaterThan(0)
  })
})
