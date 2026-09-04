import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { ProyectosList } from "./proyectos-list"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

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
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/proyectos">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Proyectos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión de proyectos de la empresa</p>
        </div>
        {puedeCrear && (
          <Link
            href="/proyectos/nuevo"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
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
    </AdminSidebar>
  )
}
