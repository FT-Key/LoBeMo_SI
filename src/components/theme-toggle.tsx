"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()

  if (!mounted) {
    return (
      <span
        className={`inline-flex items-center rounded-lg text-muted-foreground ${
          collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5 text-sm"
        }`}
        aria-hidden
      >
        <Moon className="size-4" />
        {!collapsed && <span>Tema</span>}
      </span>
    )
  }

  const esOscuro = resolvedTheme !== "light"

  return (
    <button
      onClick={() => setTheme(esOscuro ? "light" : "dark")}
      className={`flex items-center rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors w-full ${
        collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
      }`}
      title={collapsed ? (esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro") : undefined}
      aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {esOscuro ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {!collapsed && <span>{esOscuro ? "Modo claro" : "Modo oscuro"}</span>}
    </button>
  )
}
