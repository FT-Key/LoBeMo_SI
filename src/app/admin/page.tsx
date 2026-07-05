import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminView } from "./admin-view"
import Link from "next/link"
import { NotificacionDropdown } from "@/components/notificaciones/notificacion-dropdown"

const CLAVES_LABELS: Record<string, { label: string; descripcion: string }> = {
  MAX_PROYECTOS_ACTIVOS_POR_EMPLEADO: {
    label: "Máximo proyectos activos por empleado",
    descripcion: "Límite de proyectos simultáneos (EN_EJECUCION o EN_REVISION) que un empleado puede tener (RN-08)",
  },
  DIAS_AVISO_VENCIMIENTO_PROPUESTA: {
    label: "Días de aviso para vencimiento de propuestas",
    descripcion: "Anticipación en días para notificar que una propuesta está próxima a vencer (RN-15c)",
  },
  DIAS_AVISO_HITO: {
    label: "Días de aviso para hitos",
    descripcion: "Anticipación en días para notificar la fecha prevista de un hito",
  },
}

export default async function AdminPage() {
  const session = await requireAuth()

  if (session.user.rol !== "GERENTE_GENERAL") {
    redirect("/dashboard")
  }

  const configs = await prisma.configuracion.findMany({
    orderBy: { clave: "asc" },
  })

  const configMap: Record<string, string> = {}
  for (const c of configs) {
    configMap[c.clave] = c.valor
  }

  const defaults: Record<string, string> = {
    MAX_PROYECTOS_ACTIVOS_POR_EMPLEADO: "3",
    DIAS_AVISO_VENCIMIENTO_PROPUESTA: "3",
    DIAS_AVISO_HITO: "3",
  }

  const merged = { ...defaults, ...configMap }
  const items = Object.entries(CLAVES_LABELS).map(([clave, meta]) => ({
    clave,
    valor: merged[clave] ?? defaults[clave],
    ...meta,
  }))

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
            <Link href="/proyectos" className="text-sm font-medium hover:underline">Proyectos</Link>
            <Link href="/clientes" className="text-sm font-medium hover:underline">Clientes</Link>
            <Link href="/empleados" className="text-sm font-medium hover:underline">Empleados</Link>
            <Link href="/servicios" className="text-sm font-medium hover:underline">Servicios</Link>
            <Link href="/admin" className="text-sm font-medium text-primary hover:underline">Admin</Link>
            <Link href="/capacitaciones" className="text-sm font-medium hover:underline">Capacitaciones</Link>
            <Link href="/pentesting" className="text-sm font-medium hover:underline">Pentesting</Link>
            <Link href="/soporte" className="text-sm font-medium hover:underline">Soporte</Link>
            <Link href="/informes-auditoria" className="text-sm font-medium hover:underline">Auditoría</Link>
            <Link href="/calendario" className="text-sm font-medium hover:underline">Calendario</Link>
            <NotificacionDropdown />
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:underline">Cerrar sesión</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Panel de Administración</h2>
        </div>

        <p className="text-muted-foreground mb-6">
          Configura los parámetros generales del sistema.
        </p>

        <AdminView initialItems={items} />
      </main>
    </div>
  )
}
