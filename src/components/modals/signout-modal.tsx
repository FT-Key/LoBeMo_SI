"use client"

import { useState } from "react"
import { FormModal } from "@/components/ui/form-modal"

type SignOutModalProps = {
  open: boolean
  onClose: () => void
}

export function SignOutModal({ open, onClose }: SignOutModalProps) {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    window.location.href = "/api/auth/signout"
  }

  return (
    <FormModal open={open} onClose={onClose} title="Cerrar sesión" maxWidth="max-w-sm">
      <p className="text-sm text-muted-foreground mb-6">
        ¿Estás seguro que deseas cerrar sesión?
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 rounded-md border border-input text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="px-4 py-2 rounded-md bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50"
        >
          {loading ? "Cerrando..." : "Cerrar sesión"}
        </button>
      </div>
    </FormModal>
  )
}
