"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormModal } from "@/components/ui/form-modal"
import { useSavedFilters, type SavedFilter } from "@/hooks/use-saved-filters"

interface SavedFiltersProps {
  modulo: string
  currentFilters: Record<string, string>
  onApplyFilter: (filters: Record<string, string>) => void
}

export function SavedFilters({ modulo, currentFilters, onApplyFilter }: SavedFiltersProps) {
  const { filters, loading, saveFilter, deleteFilter, refresh } = useSavedFilters({ modulo })
  const [open, setOpen] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [filterName, setFilterName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const didFetchRef = useRef(false)

  const doRefresh = useCallback(() => { void refresh() }, [refresh])

  useEffect(() => {
    if (!didFetchRef.current) {
      didFetchRef.current = true
      doRefresh()
    }
  }, [doRefresh])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const hasActiveFilters = Object.values(currentFilters).some((v) => v !== "")

  const handleSave = async () => {
    if (!filterName.trim()) return
    setSaving(true)
    setError(null)
    const result = await saveFilter(filterName.trim(), currentFilters)
    setSaving(false)
    if (result.success) {
      setSaveModalOpen(false)
      setFilterName("")
    } else {
      setError(result.error || "Error al guardar")
    }
  }

  const handleApply = (filter: SavedFilter) => {
    onApplyFilter(filter.filtros as Record<string, string>)
    setOpen(false)
  }

  const handleDelete = async (id: string) => {
    await deleteFilter(id)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5"
      >
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Vistas guardadas
        {filters.length > 0 && (
          <span className="ml-1 rounded-full bg-primary/10 px-1.5 text-xs font-medium text-primary">
            {filters.length}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-72 rounded-xl border border-border/50 bg-background shadow-xl">
          <div className="p-2 border-b border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                if (hasActiveFilters) {
                  setSaveModalOpen(true)
                  setOpen(false)
                }
              }}
              disabled={!hasActiveFilters}
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Guardar filtros actuales
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Cargando...
              </div>
            ) : filters.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No hay vistas guardadas
              </div>
            ) : (
              <div className="p-1">
                {filters.map((filter) => (
                  <div
                    key={filter.id}
                    className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50"
                  >
                    <button
                      onClick={() => handleApply(filter)}
                      className="flex-1 text-left text-sm font-medium truncate"
                    >
                      {filter.nombre}
                    </button>
                    <button
                      onClick={() => handleDelete(filter.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1 rounded"
                    >
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <FormModal
        open={saveModalOpen}
        onClose={() => {
          setSaveModalOpen(false)
          setFilterName("")
          setError(null)
        }}
        title="Guardar vista"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="filter-name">Nombre de la vista</Label>
            <Input
              id="filter-name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Ej: Activos con rol Admin"
              maxLength={50}
              className="mt-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && filterName.trim()) {
                  handleSave()
                }
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {filterName.length}/50 caracteres
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSaveModalOpen(false)
                setFilterName("")
                setError(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!filterName.trim() || saving}
            >
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </FormModal>
    </div>
  )
}
