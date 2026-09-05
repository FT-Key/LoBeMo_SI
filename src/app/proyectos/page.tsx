import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { ProyectosList } from "./proyectos-list"
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
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Proyectos</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestión de proyectos de la empresa</p>
      </div>

      <ProyectosList
        initialData={JSON.parse(JSON.stringify(proyectos))}
        initialTotal={total}
        clientes={JSON.parse(JSON.stringify(clientes))}
        servicios={JSON.parse(JSON.stringify(servicios))}
        estadoLabels={ESTADO_LABELS}
        puedeCrear={puedeCrear}
      />
    </AdminSidebar>
  )
}
