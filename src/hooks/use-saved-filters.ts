"use client"

import { useState, useCallback, useRef } from "react"

export interface SavedFilter {
  id: string
  nombre: string
  modulo: string
  filtros: Record<string, string>
  createdAt: string
}

interface UseSavedFiltersOptions {
  modulo: string
}

export function useSavedFilters({ modulo }: UseSavedFiltersOptions) {
  const [filters, setFilters] = useState<SavedFilter[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const fetchFilters = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ modulo })
      const res = await fetch(`/api/saved-filters?${params}`)
      if (!res.ok) throw new Error("Error al cargar filtros guardados")
      const json = await res.json()
      if (mountedRef.current) {
        setFilters(json.data)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [modulo])

  const saveFilter = useCallback(
    async (nombre: string, filtros: Record<string, string>) => {
      setError(null)
      try {
        const res = await fetch("/api/saved-filters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, modulo, filtros }),
        })
        if (!res.ok) {
          const json = await res.json()
          throw new Error(json.error || "Error al guardar filtro")
        }
        const json = await res.json()
        setFilters((prev) => [json.data, ...prev])
        return { success: true }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido"
        setError(message)
        return { success: false, error: message }
      }
    },
    [modulo]
  )

  const deleteFilter = useCallback(async (id: string) => {
    setError(null)
    try {
      const params = new URLSearchParams({ id })
      const res = await fetch(`/api/saved-filters?${params}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Error al eliminar filtro")
      setFilters((prev) => prev.filter((f) => f.id !== id))
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido"
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  return {
    filters,
    loading,
    error,
    saveFilter,
    deleteFilter,
    refresh: fetchFilters,
  }
}
