"use client"

import { useState } from "react"
import { BookOpen, FileText } from "lucide-react"
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
    <div className="flex gap-6 min-h-[600px]">
      {/* Sidebar de manuales */}
      <aside className="w-64 shrink-0 border border-border rounded-lg bg-surface overflow-hidden">
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
      <div className="flex-1 border border-border rounded-lg bg-surface overflow-hidden">
        {selectedManual ? (
          <div className="p-6 overflow-y-auto max-h-[600px]">
            <MarkdownRenderer content={selectedManual.content} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Selecciona un manual para ver su contenido.</p>
          </div>
        )}
      </div>
    </div>
  )
}
