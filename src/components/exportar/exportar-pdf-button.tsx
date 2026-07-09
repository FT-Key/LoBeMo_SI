"use client"

import { useState } from "react"
import { FileDown, Loader2 } from "lucide-react"

export function ExportarPDFButton({ url, label = "Exportar PDF" }: { url: string; label?: string }) {
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    setLoading(true)
    window.open(url, "_blank")
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      {label}
    </button>
  )
}
