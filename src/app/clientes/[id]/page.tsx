import { requireAuth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SECTORES_LABELS } from "@/shared/validation"
import Link from "next/link"

const ESTADO_PROYECTO_LABELS: Record<string, string> = {
  BORRADOR: "Borrador",
  PENDIENTE_APROBACION: "Pendiente aprobación",
  APROBADO: "Aprobado",
  EN_EJECUCION: "En ejecución",
  EN_REVISION: "En revisión",
  COMPLETADO: "Completado",
  CERRADO: "Cerrado",
}

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const { id } = await params

  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      proyectos: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          nombre: true,
          estado: true,
          fechaInicio: true,
          fechaEstimadaFin: true,
          _count: { select: { tareas: true } },
        },
      },
      _count: { select: { proyectos: true } },
    },
  })

  if (!cliente) {
    redirect("/clientes")
  }

  const clienteData = cliente as typeof cliente & {
    proyectos: Array<{
      id: string
      nombre: string
      estado: string
      fechaInicio: Date
      fechaEstimadaFin: Date | null
      _count: { tareas: number }
    }>
    _count: { proyectos: number }
  }

  const proyectosActivos = clienteData.proyectos.filter(
    (p) => !["CERRADO", "COMPLETADO"].includes(p.estado)
  )

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/clientes">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{cliente.razonSocial}</h2>
            <p className="text-sm text-muted-foreground">
              CUIT: {cliente.cuit} | Sector: {cliente.sector ? (SECTORES_LABELS[cliente.sector] || cliente.sector) : "—"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/clientes/${cliente.id}/editar`}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-muted"
            >
              Editar
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-md border p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Email de contacto</p>
            <p className="text-sm font-medium">{cliente.emailContacto || "—"}</p>
          </div>
          <div className="rounded-md border p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Teléfono</p>
            <p className="text-sm font-medium">{cliente.telefono || "—"}</p>
          </div>
          <div className="rounded-md border p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Dirección</p>
            <p className="text-sm font-medium">{cliente.direccion || "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-md border p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Estado</p>
            <p className="text-sm font-medium">
              {cliente.activo ? (
                <span className="text-green-600">Activo</span>
              ) : (
                <span className="text-red-600">Inactivo</span>
              )}
            </p>
          </div>
          <div className="rounded-md border p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Fecha de registro</p>
            <p className="text-sm font-medium">
              {new Date(cliente.fechaRegistro).toLocaleDateString("es-AR")}
            </p>
          </div>
          <div className="rounded-md border p-4 space-y-1">
            <p className="text-xs text-muted-foreground">Proyectos</p>
            <p className="text-sm font-medium">
              {clienteData._count.proyectos} total ({proyectosActivos.length} activos)
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Proyectos</h3>
          {clienteData.proyectos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay proyectos registrados para este cliente.</p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium">Nombre</th>
                    <th className="text-left p-3 text-sm font-medium">Estado</th>
                    <th className="text-left p-3 text-sm font-medium">Tareas</th>
                    <th className="text-left p-3 text-sm font-medium">Inicio</th>
                    <th className="text-left p-3 text-sm font-medium">Est. Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {clienteData.proyectos.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="p-3 text-sm">
                        <Link href={`/proyectos/${p.id}`} className="hover:underline text-primary">
                          {p.nombre}
                        </Link>
                      </td>
                      <td className="p-3 text-sm">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-muted border">
                          {ESTADO_PROYECTO_LABELS[p.estado] || p.estado}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{p._count.tareas}</td>
                      <td className="p-3 text-sm">
                        {new Date(p.fechaInicio).toLocaleDateString("es-AR")}
                      </td>
                      <td className="p-3 text-sm">
                        {p.fechaEstimadaFin ? new Date(p.fechaEstimadaFin).toLocaleDateString("es-AR") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminSidebar>
  )
}
