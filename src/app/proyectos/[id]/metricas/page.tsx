import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { NotificacionDropdown } from "@/components/notificaciones/notificacion-dropdown"
import { MetricasProyecto } from "./metricas-content"

export default async function MetricasProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const { id } = await params

  const puedeVer = ["CISO", "GERENTE_GENERAL"].includes(session.user.rol)
  if (!puedeVer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No autorizado</p>
      </div>
    )
  }

  const proyecto = await prisma.proyecto.findUnique({
    where: { id },
    select: { id: true, nombre: true, estado: true },
  })

  if (!proyecto) notFound()

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
            <Link href="/calendario" className="text-sm font-medium hover:underline">Calendario</Link>
            <NotificacionDropdown />
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:underline">Cerrar sesión</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/proyectos/${id}`} className="text-sm text-primary hover:underline">← Volver al proyecto</Link>
          <h2 className="text-2xl font-bold mt-2">Métricas: {proyecto.nombre}</h2>
          <p className="text-sm text-muted-foreground mt-1">Estado: {proyecto.estado.replace(/_/g, " ")}</p>
        </div>

        <MetricasProyecto proyectoId={id} />
      </main>
    </div>
  )
}
