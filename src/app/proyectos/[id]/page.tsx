import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ProyectoDetalle } from "./proyecto-detalle"
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

export default async function ProyectoDetallePage(props: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  const { id } = await props.params

  const empleados = await prisma.empleado.findMany({
    where: { activo: true },
    orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    select: { id: true, nombre: true, apellido: true, rol: true, area: true },
  })

  const proyecto = await prisma.proyecto.findUnique({
    where: { id },
    include: {
      cliente: true,
      servicio: true,
      propuestas: { orderBy: { createdAt: "desc" } },
      asignaciones: {
        include: {
          empleado: { select: { id: true, nombre: true, apellido: true, rol: true } },
        },
      },
      tareas: {
        orderBy: { createdAt: "desc" },
        include: {
          asignacion: {
            include: {
              empleado: { select: { id: true, nombre: true, apellido: true, rol: true } },
            },
          },
        },
      },
      hitos: { orderBy: { fechaPrevista: "asc" } },
      documentos: { orderBy: { createdAt: "desc" } },
      historialEstados: {
        orderBy: { createdAt: "desc" },
        include: {
          empleado: { select: { id: true, nombre: true, apellido: true } },
        },
      },
      _count: { select: { tareas: true, asignaciones: true, propuestas: true, documentos: true } },
    },
  })

  if (!proyecto) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
            <Link href="/proyectos" className="text-sm font-medium hover:underline">Proyectos</Link>
            <Link href="/clientes" className="text-sm font-medium hover:underline">Clientes</Link>
            <Link href="/servicios" className="text-sm font-medium hover:underline">Servicios</Link>
            <Link href="/informes-auditoria" className="text-sm font-medium hover:underline">Auditoría</Link>
            <NotificacionDropdown />
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:underline">Cerrar sesión</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Link href="/proyectos" className="text-sm text-muted-foreground hover:underline">&larr; Volver a proyectos</Link>
          <span className="text-muted-foreground mx-2">|</span>
          <Link href={`/proyectos/${id}/metricas`} className="text-sm text-primary hover:underline">Métricas</Link>
        </div>

        <ProyectoDetalle
          proyecto={JSON.parse(JSON.stringify(proyecto))}
          sessionRol={session.user.rol}
          sessionUserId={session.user.id}
          estadoLabels={ESTADO_LABELS}
          empleados={JSON.parse(JSON.stringify(empleados))}
        />
      </main>
    </div>
  )
}
