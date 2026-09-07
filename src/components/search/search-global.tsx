"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, FolderOpen, Users, UserCog, FileText } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

type SearchResult = {
  tipo: "proyecto" | "cliente" | "empleado" | "tarea"
  id: string
  titulo: string
  subtitulo: string
  href: string | null
}

const TIPO_ICONS: Record<string, React.ReactNode> = {
  proyecto: <FolderOpen className="size-4 text-primary" />,
  cliente: <Users className="size-4 text-success" />,
  empleado: <UserCog className="size-4 text-warning" />,
  tarea: <FileText className="size-4 text-accent" />,
}

const TIPO_LABELS: Record<string, string> = {
  proyecto: "Proyectos",
  cliente: "Clientes",
  empleado: "Empleados",
  tarea: "Tareas",
}

export function SearchGlobal() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.length < 2) return

    let cancelled = false
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setResults(data.results ?? [])
          setOpen(true)
        }
      })
      .catch(() => { if (!cancelled) setResults([]) })

    return () => { cancelled = true }
  }, [debouncedQuery])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const grouped = results.reduce((acc, r) => {
    if (!acc[r.tipo]) acc[r.tipo] = []
    acc[r.tipo].push(r)
    return acc
  }, {} as Record<string, SearchResult[]>)

  function handleSelect(result: SearchResult) {
    setOpen(false)
    setQuery("")
    if (result.href) {
      router.push(result.href)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Buscar..."
          className="w-full h-9 pl-9 pr-12 rounded-lg bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
          Ctrl+K
        </kbd>
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-border bg-surface shadow-xl max-h-80 overflow-y-auto">
          {Object.entries(grouped).map(([tipo, items]) => (
            <div key={tipo}>
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 bg-muted/30">
                {TIPO_LABELS[tipo]}
              </div>
              {items.map((r) => (
                <button
                  key={`${r.tipo}-${r.id}`}
                  onClick={() => handleSelect(r)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                >
                  {TIPO_ICONS[r.tipo]}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.titulo}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.subtitulo}</p>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
