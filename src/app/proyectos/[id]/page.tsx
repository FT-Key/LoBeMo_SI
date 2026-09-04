import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ProyectoDetalle } from "./proyecto-detalle"
import { ExportarPDFButton } from "@/components/exportar/exportar-pdf-button"
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
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/proyectos">
      <div className="max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/proyectos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Volver a proyectos</Link>
            <span className="text-muted-foreground mx-1">|</span>
            <Link href={`/proyectos/${id}/metricas`} className="text-sm text-primary hover:underline">Métricas</Link>
          </div>
          <ExportarPDFButton url={`/api/exportar/proyecto/${id}`} label="Exportar PDF" />
        </div>

        <ProyectoDetalle
          proyecto={JSON.parse(JSON.stringify(proyecto))}
          sessionRol={session.user.rol}
          sessionUserId={session.user.id}
          estadoLabels={ESTADO_LABELS}
          empleados={JSON.parse(JSON.stringify(empleados))}
        />
      </div>
    </AdminSidebar>
  )
}
