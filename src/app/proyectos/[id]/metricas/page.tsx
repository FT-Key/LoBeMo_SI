import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MetricasProyecto } from "./metricas-content"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

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
      <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/proyectos">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No autorizado</p>
        </div>
      </AdminSidebar>
    )
  }

  const proyecto = await prisma.proyecto.findUnique({
    where: { id },
    select: { id: true, nombre: true, estado: true },
  })

  if (!proyecto) notFound()

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/proyectos">
      <div className="max-w-5xl">
        <div className="mb-6">
          <Link href={`/proyectos/${id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Volver al proyecto</Link>
          <h2 className="text-2xl font-bold mt-2">Métricas: {proyecto.nombre}</h2>
          <p className="text-sm text-muted-foreground mt-1">Estado: {proyecto.estado.replace(/_/g, " ")}</p>
        </div>

        <MetricasProyecto proyectoId={id} />
      </div>
    </AdminSidebar>
  )
}
