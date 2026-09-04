"use client"

import { useState, useRef, useEffect } from "react"
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
  const tabsRef = useRef<HTMLDivElement>(null)

  const selectedManual = manuals.find((m) => m.slug === selectedSlug)

  useEffect(() => {
    if (tabsRef.current) {
      const activeTab = tabsRef.current.querySelector("[data-active=true]")
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      }
    }
  }, [selectedSlug])

  if (manuals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="size-12 mx-auto mb-4 opacity-50" />
        <p>No hay manuales disponibles.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 min-h-[400px] lg:min-h-[600px]">
      {/* Tabs mobile - horizontal scrollable */}
      <div className="lg:hidden">
        <div
          ref={tabsRef}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        >
          {manuals.map((manual) => {
            const isSelected = manual.slug === selectedSlug
            return (
              <button
                key={manual.slug}
                data-active={isSelected}
                onClick={() => setSelectedSlug(manual.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface border border-border text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <FileText className="size-3.5" />
                {manual.title}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-64 shrink-0 border border-border rounded-lg bg-surface overflow-hidden self-start">
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
    </div>
  )
}
