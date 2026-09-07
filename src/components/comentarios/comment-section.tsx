"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export type Comentario = {
  id: string
  contenido: string
  createdAt: string
  autor: {
    id: string
    nombre: string
    apellido: string
    rol: string
  }
}

interface CommentSectionProps {
  proyectoId?: string
  tareaId?: string
  ticketId?: string
  sessionUserId: string
  initialData?: Comentario[]
}

const ROL_LABELS: Record<string, string> = {
  GERENTE_GENERAL: "Gerente General",
  ADMINISTRACION: "Administración",
  VENTAS: "Ventas",
  CISO: "CISO",
  ANALISTA_SEGURIDAD: "Analista de Seguridad",
  DESARROLLADOR: "Desarrollador",
  ESPECIALISTA_REDES: "Especialista en Redes",
  PENTESTER: "Pentester",
  SOPORTE_TECNICO: "Soporte Técnico",
  AUDITOR: "Auditor",
  CAPACITADOR: "Capacitador",
}

export function CommentSection({
  proyectoId,
  tareaId,
  ticketId,
  sessionUserId,
  initialData = [],
}: CommentSectionProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>(initialData)
  const [nuevoComentario, setNuevoComentario] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEnviar() {
    if (!nuevoComentario.trim() || enviando) return
    setEnviando(true)
    setError(null)

    try {
      const res = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contenido: nuevoComentario.trim(),
          proyectoId,
          tareaId,
          ticketId,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Error al enviar comentario")
      }

      const json = await res.json()
      setComentarios((prev) => [...prev, json.data])
      setNuevoComentario("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setEnviando(false)
    }
  }

  async function handleEliminar(id: string) {
    try {
      const res = await fetch(`/api/comentarios/${id}`, { method: "DELETE" })
      if (res.ok) {
        setComentarios((prev) => prev.filter((c) => c.id !== id))
      }
    } catch {
      setError("Error al eliminar comentario")
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        Comentarios {comentarios.length > 0 && `(${comentarios.length})`}
      </h3>

      {comentarios.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay comentarios aún</p>
      ) : (
        <div className="space-y-3">
          {comentarios.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-border/50 bg-muted/30 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      {c.autor.nombre} {c.autor.apellido}
                    </span>
                    <span className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                      {ROL_LABELS[c.autor.rol] ?? c.autor.rol}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-wrap break-words">
                    {c.contenido}
                  </p>
                </div>
                {c.autor.id === sessionUserId && (
                  <button
                    onClick={() => handleEliminar(c.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded shrink-0"
                    title="Eliminar comentario"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          placeholder="Escribir un comentario..."
          rows={2}
          maxLength={2000}
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              handleEnviar()
            }
          }}
        />
        <Button
          size="sm"
          onClick={handleEnviar}
          disabled={!nuevoComentario.trim() || enviando}
          className="self-end"
        >
          {enviando ? "..." : "Enviar"}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Ctrl+Enter para enviar
      </p>
    </div>
  )
}
