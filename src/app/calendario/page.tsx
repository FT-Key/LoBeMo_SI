import { requireAuth } from "@/lib/auth-helpers"
import { CalendarioView } from "./calendario-view"
import Link from "next/link"
import { NotificacionDropdown } from "@/components/notificaciones/notificacion-dropdown"

export default async function CalendarioPage() {
  const session = await requireAuth()
  const rol = session.user.rol

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
            <Link href="/proyectos" className="text-sm font-medium hover:underline">Proyectos</Link>
            <Link href="/clientes" className="text-sm font-medium hover:underline">Clientes</Link>
            {rol === "GERENTE_GENERAL" && (
              <Link href="/empleados" className="text-sm font-medium hover:underline">Empleados</Link>
            )}
            <Link href="/servicios" className="text-sm font-medium hover:underline">Servicios</Link>
            <Link href="/capacitaciones" className="text-sm font-medium hover:underline">Capacitaciones</Link>
            <Link href="/pentesting" className="text-sm font-medium hover:underline">Pentesting</Link>
            <Link href="/soporte" className="text-sm font-medium hover:underline">Soporte</Link>
            <Link href="/calendario" className="text-sm font-medium text-primary hover:underline">Calendario</Link>
            <NotificacionDropdown />
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:underline">Cerrar sesión</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Calendario</h2>
          <p className="text-sm text-muted-foreground mt-1">Hitos y vencimientos de propuestas</p>
        </div>

        <CalendarioView />
      </main>
    </div>
  )
}
