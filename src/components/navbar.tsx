import Link from "next/link"
import Image from "next/image"
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
  const items = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(rol)
  )

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Image
          src="/lobemo-mini.png"
          alt="LoBeMo"
          width={100}
          height={28}
          className="h-7 w-auto"
        />
        <nav className="flex items-center gap-4">
          {items.map((item) => {
            const isActive =
              currentPath === item.href ||
              currentPath.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium hover:underline ${
                  isActive ? "text-primary" : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <NotificacionDropdown />
          <span className="text-sm text-muted-foreground">{name}</span>
          <Link
            href="/api/auth/signout"
            className="text-sm text-muted-foreground hover:underline"
          >
            Cerrar sesión
          </Link>
        </nav>
      </div>
    </header>
  )
}
