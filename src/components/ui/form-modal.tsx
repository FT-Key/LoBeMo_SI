"use client"

import { useEffect } from "react"

type FormModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export function FormModal({ open, onClose, title, children, maxWidth = "max-w-lg" }: FormModalProps) {
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative z-10 w-full ${maxWidth} mx-4 max-h-[85vh] overflow-y-auto rounded-2xl border border-border/50 bg-background p-6 shadow-2xl`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-lg leading-none p-1"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
