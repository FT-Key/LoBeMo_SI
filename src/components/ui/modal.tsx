"use client"

import { useEffect, useRef } from "react"

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
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

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg border border-border bg-background p-0 backdrop:bg-black/50 max-w-lg w-full open:flex"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
    >
      <div className="p-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-lg leading-none"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
