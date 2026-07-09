"use client"

import { useState, useRef, useEffect } from "react"
import { Bell } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

type Notificacion = {
  id: string
  titulo: string
  mensaje: string
  tipo: string
  link: string | null
  leida: boolean
  createdAt: string
}

export function NotificacionDropdown() {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  const { data, isFetching } = useQuery({
    queryKey: ["notificaciones"],
    queryFn: async () => {
      const res = await fetch("/api/notificaciones?limit=10")
      if (!res.ok) throw new Error("Error al cargar notificaciones")
      return res.json() as Promise<{
        data: Notificacion[]
        unreadCount: number
      }>
    },
    refetchInterval: 30000,
  })

  const marcarLeidas = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/notificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
      if (!res.ok) throw new Error("Error al marcar como leídas")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificaciones"] })
    },
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const notificaciones = data?.data ?? []
  const unreadCount = data?.unreadCount ?? 0

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next && unreadCount > 0) {
      const unreadIds = notificaciones.filter((n) => !n.leida).map((n) => n.id)
      if (unreadIds.length > 0) {
        marcarLeidas.mutate(unreadIds)
      }
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={handleToggle}
        className="relative p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center size-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border bg-background shadow-2xl z-[100]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
            {isFetching && (
              <span className="text-xs text-muted-foreground animate-pulse">
                Actualizando...
              </span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notificaciones.length === 0 && (
              <p className="px-4 py-8 text-sm text-muted-foreground text-center">
                No tienes notificaciones
              </p>
            )}
            {notificaciones.map((n) => (
              <a
                key={n.id}
                href={n.link ?? "#"}
                className={cn(
                  "block px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors",
                  !n.leida && "bg-muted/20"
                )}
              >
                <p className="text-sm font-medium text-foreground">{n.titulo}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {n.mensaje}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatRelativeTime(n.createdAt)}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function formatRelativeTime(dateString: string) {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Ahora"
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  return date.toLocaleDateString("es-AR")
}
