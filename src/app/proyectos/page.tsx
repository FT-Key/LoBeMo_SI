import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { ProyectosList } from "./proyectos-list"
import Link from "next/link"
import { NotificacionDropdown } from "@/components/notificaciones/notificacion-dropdown"

const ESTADO_LABELS: Record<string, string> = {
  RELEVAMIENTO: "Relevamiento",
  PROPUESTA: "Propuesta",
  APROBADO: "Aprobado",
  EN_EJECUCION: "En Ejecución",
  EN_REVISION: "En Revisión",
  ENTREGADO: "Entregado",
  CERRADO: "Cerrado",
}

export default async function ProyectosPage() {
  const session = await requireAuth()
  const puedeCrear = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"

  const [proyectos, total, clientes, servicios] = await Promise.all([
    prisma.proyecto.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        cliente: { select: { id: true, razonSocial: true } },
        servicio: { select: { id: true, nombre: true } },
        _count: { select: { tareas: true, asignaciones: true, propuestas: true } },
        historialEstados: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { estadoNuevo: true, createdAt: true },
        },
      },
    }),
    prisma.proyecto.count(),
    prisma.cliente.findMany({ where: { activo: true }, orderBy: { razonSocial: "asc" }, select: { id: true, razonSocial: true } }),
    prisma.servicio.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
  ])

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
            <Link href="/clientes" className="text-sm font-medium hover:underline">Clientes</Link>
            <Link href="/servicios" className="text-sm font-medium hover:underline">Servicios</Link>
            <Link href="/capacitaciones" className="text-sm font-medium hover:underline">Capacitaciones</Link>
            <Link href="/pentesting" className="text-sm font-medium hover:underline">Pentesting</Link>
            <Link href="/soporte" className="text-sm font-medium hover:underline">Soporte</Link>
            {puedeCrear && (
              <Link href="/empleados" className="text-sm font-medium hover:underline">Empleados</Link>
            )}
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
          <h2 className="text-2xl font-bold">Proyectos</h2>
          {puedeCrear && (
            <Link
              href="/proyectos/nuevo"
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Nuevo proyecto
            </Link>
          )}
        </div>

        <ProyectosList
          initialData={JSON.parse(JSON.stringify(proyectos))}
          initialTotal={total}
          clientes={JSON.parse(JSON.stringify(clientes))}
          servicios={JSON.parse(JSON.stringify(servicios))}
          estadoLabels={ESTADO_LABELS}
        />
      </main>
    </div>
  )
}
