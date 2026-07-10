"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { NotificacionDropdown } from "@/components/notificaciones/notificacion-dropdown"

type NavbarProps = {
  name: string | null | undefined
  rol: string
  currentPath: string
}

const NAV_ITEMS: { href: string; label: string; roles: string[] | null }[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["GERENTE_GENERAL", "CISO", "ADMINISTRACION"] },
  { href: "/proyectos", label: "Proyectos", roles: null },
  { href: "/clientes", label: "Clientes", roles: null },
  { href: "/empleados", label: "Empleados", roles: ["GERENTE_GENERAL"] },
  { href: "/servicios", label: "Servicios", roles: null },
  { href: "/capacitaciones", label: "Capacitaciones", roles: ["CAPACITADOR", "GERENTE_GENERAL", "CISO"] },
  { href: "/pentesting", label: "Pentesting", roles: ["PENTESTER", "CISO", "GERENTE_GENERAL", "ANALISTA_SEGURIDAD"] },
  { href: "/soporte", label: "Soporte", roles: ["SOPORTE_TECNICO", "GERENTE_GENERAL", "CISO"] },
  { href: "/informes-auditoria", label: "Auditoría", roles: ["AUDITOR", "GERENTE_GENERAL", "CISO"] },
  { href: "/calendario", label: "Calendario", roles: null },
  { href: "/admin", label: "Admin", roles: ["GERENTE_GENERAL"] },
]

export function Navbar({ name, rol, currentPath }: NavbarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const items = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(rol)
  )

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [sidebarOpen])

  return (
    <>
      <header className="border-b border-border relative z-30 bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </button>
            <Image
              src="/lobemo-mini.png"
              alt="LoBeMo"
              width={100}
              height={28}
              className="h-7 w-auto"
            />
          </div>
          <div className="flex items-center gap-3">
            <NotificacionDropdown />
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {name}
            </span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-muted-foreground hover:underline"
            >
              Cerrar sesión
            </Link>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-surface border-r border-border transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-full sm:w-72`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <Image
            src="/lobemo-mini.png"
            alt="LoBeMo"
            width={100}
            height={28}
            className="h-7 w-auto"
          />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-1 overflow-y-auto h-[calc(100%-65px)]">
          {items.map((item) => {
            const isActive =
              currentPath === item.href ||
              currentPath.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <div className="mt-auto border-t border-border pt-4 sm:hidden">
            <span className="block text-sm text-muted-foreground px-4">
              {name}
            </span>
          </div>
        </nav>
      </aside>
    </>
  )
}
