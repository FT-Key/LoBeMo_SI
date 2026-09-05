"use client"

import { useEffect, useRef } from "react"

type FormModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export function FormModal({ open, onClose, title, children, maxWidth = "max-w-lg" }: FormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handler = () => onClose()
    dialog.addEventListener("close", handler)
    return () => dialog.removeEventListener("close", handler)
  }, [onClose])

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

  return (
    <dialog
      ref={dialogRef}
      className={`rounded-lg border border-border bg-background p-0 backdrop:bg-black/50 ${maxWidth} w-full open:flex`}
    >
      <div className="p-6 w-full max-h-[85vh] overflow-y-auto">
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
    </dialog>
  )
}
