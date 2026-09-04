"use client"

import { useState } from "react"
import { BookOpen, FileText, ChevronDown } from "lucide-react"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"

interface ManualFile {
  slug: string
  title: string
  content: string
}

interface ManualViewProps {
  manuals: ManualFile[]
}

export function ManualView({ manuals }: ManualViewProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    manuals.length > 0 ? manuals[0].slug : null
  )
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const selectedManual = manuals.find((m) => m.slug === selectedSlug)

  if (manuals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="size-12 mx-auto mb-4 opacity-50" />
        <p>No hay manuales disponibles.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-[400px] lg:min-h-[600px]">
      {/* Selector mobile */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 border border-border rounded-lg bg-surface text-sm font-medium"
        >
          <span className="flex items-center gap-2">
            <FileText className="size-4" />
            {selectedManual?.title ?? "Seleccionar manual"}
          </span>
          <ChevronDown className={`size-4 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} />
        </button>
        {mobileMenuOpen && (
          <div className="mt-1 border border-border rounded-lg bg-surface overflow-hidden">
            {manuals.map((manual) => {
              const isSelected = manual.slug === selectedSlug
              return (
                <button
                  key={manual.slug}
                  onClick={() => {
                    setSelectedSlug(manual.slug)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left border-b border-border last:border-b-0 ${
                    isSelected
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <FileText className="size-4 shrink-0" />
                  <span>{manual.title}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden lg:block w-64 shrink-0 border border-border rounded-lg bg-surface overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Manuales
          </h3>
        </div>
        <nav className="p-2">
          {manuals.map((manual) => {
            const isSelected = manual.slug === selectedSlug
            return (
              <button
                key={manual.slug}
                onClick={() => setSelectedSlug(manual.slug)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left ${
                  isSelected
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                <FileText className="size-4 shrink-0" />
                <span className="truncate">{manual.title}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Panel de contenido */}
      <div className="flex-1 border border-border rounded-lg bg-surface overflow-hidden min-h-0">
        {selectedManual ? (
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[500px] lg:max-h-[600px]">
            <MarkdownRenderer content={selectedManual.content} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground py-12">
            <p>Selecciona un manual para ver su contenido.</p>
          </div>
        )}
      </div>
    </div>
  )
}
