"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import {
  Menu,
  X,
  LayoutDashboard,
  FolderOpen,
  Users,
  UserCog,
  Briefcase,
  GraduationCap,
  Shield,
  HeadphonesIcon,
  FileText,
  Calendar,
  BookOpen,
  Settings,
  ChevronLeft,
  LogOut,
} from "lucide-react"
import { NotificacionDropdown } from "@/components/notificaciones/notificacion-dropdown"

type AdminSidebarProps = {
  name: string | null | undefined
  rol: string
  currentPath: string
  children: React.ReactNode
}

const NAV_ITEMS: {
  href: string
  label: string
  roles: string[] | null
  icon: React.ReactNode
  section?: string
}[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["GERENTE_GENERAL", "CISO", "ADMINISTRACION"], icon: <LayoutDashboard className="size-4" />, section: "Principal" },
  { href: "/proyectos", label: "Proyectos", roles: null, icon: <FolderOpen className="size-4" />, section: "Gestión" },
  { href: "/clientes", label: "Clientes", roles: null, icon: <Users className="size-4" />, section: "Gestión" },
  { href: "/empleados", label: "Empleados", roles: ["GERENTE_GENERAL"], icon: <UserCog className="size-4" />, section: "Gestión" },
  { href: "/servicios", label: "Servicios", roles: null, icon: <Briefcase className="size-4" />, section: "Gestión" },
  { href: "/capacitaciones", label: "Capacitaciones", roles: ["CAPACITADOR", "GERENTE_GENERAL", "CISO"], icon: <GraduationCap className="size-4" />, section: "Operaciones" },
  { href: "/pentesting", label: "Pentesting", roles: ["PENTESTER", "CISO", "GERENTE_GENERAL", "ANALISTA_SEGURIDAD"], icon: <Shield className="size-4" />, section: "Operaciones" },
  { href: "/soporte", label: "Soporte", roles: ["SOPORTE_TECNICO", "GERENTE_GENERAL", "CISO"], icon: <HeadphonesIcon className="size-4" />, section: "Operaciones" },
  { href: "/informes-auditoria", label: "Auditoría", roles: ["AUDITOR", "GERENTE_GENERAL", "CISO"], icon: <FileText className="size-4" />, section: "Operaciones" },
  { href: "/calendario", label: "Calendario", roles: null, icon: <Calendar className="size-4" />, section: "Herramientas" },
  { href: "/admin/manual", label: "Manual", roles: ["GERENTE_GENERAL"], icon: <BookOpen className="size-4" />, section: "Sistema" },
  { href: "/admin", label: "Configuración", roles: ["GERENTE_GENERAL"], icon: <Settings className="size-4" />, section: "Sistema" },
]

export function AdminSidebar({ name, rol, currentPath, children }: AdminSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(rol))

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

  const groupedItems = items.reduce((acc, item) => {
    const section = item.section || "Otros"
    if (!acc[section]) acc[section] = []
    acc[section].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border bg-surface transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div className={`flex items-center border-b border-border ${collapsed ? "justify-center px-2 py-4" : "justify-between px-4 py-4"}`}>
          {!collapsed && (
            <Image src="/lobemo-mini.png" alt="LoBeMo" width={100} height={28} className="h-5 w-auto" />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            <ChevronLeft className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {Object.entries(groupedItems).map(([section, sectionItems]) => (
            <div key={section} className="mb-4">
              {!collapsed && (
                <div className="px-4 mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {section}
                  </span>
                </div>
              )}
              {sectionItems.map((item) => {
                const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 mx-2 rounded-lg text-sm font-medium transition-all ${
                      collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
                    } ${
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className={`border-t border-border p-3 ${collapsed ? "flex justify-center" : ""}`}>
          <Link
            href="/api/auth/signout"
            className={`flex items-center gap-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ${
              collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
            }`}
            title={collapsed ? "Cerrar sesión" : undefined}
          >
            <LogOut className="size-4" />
            {!collapsed && <span>Cerrar sesión</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-surface border-r border-border transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-72`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <Image src="/lobemo-mini.png" alt="LoBeMo" width={100} height={28} className="h-5 w-auto" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-col p-3 gap-1 overflow-y-auto h-[calc(100%-65px)]">
          {Object.entries(groupedItems).map(([section, sectionItems]) => (
            <div key={section} className="mb-3">
              <div className="px-3 mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {section}
                </span>
              </div>
              {sectionItems.map((item) => {
                const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
          <div className="mt-auto border-t border-border pt-3">
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <LogOut className="size-4" />
              <span>Cerrar sesión</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="border-b border-border bg-surface/50 backdrop-blur-sm relative z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors lg:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="size-5" />
              </button>
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Bienvenido,</span>
                <span className="text-sm font-semibold text-foreground">{name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificacionDropdown />
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30">
                <div className="size-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground">{rol.replace(/_/g, " ")}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
