import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { CapacitacionDetalle } from "@/components/capacitaciones/capacitacion-detalle"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { notFound } from "next/navigation"

export default async function CapacitacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const { id } = await params

  const puedeVer = session.user.rol === "CAPACITADOR" || session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"
  if (!puedeVer) {
    return (
      <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/capacitaciones">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">No autorizado</p>
        </div>
      </AdminSidebar>
    )
  }

  const capacitacion = await prisma.capacitacion.findUnique({
    where: { id },
    include: {
      proyecto: { select: { id: true, nombre: true, estado: true } },
      asistentes: {
        orderBy: { createdAt: "asc" },
        include: {
          certificado: { select: { id: true, codigoCertificado: true, fechaEmision: true } },
        },
      },
    },
  })

  if (!capacitacion) {
    notFound()
  }

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/capacitaciones">
      <div className="max-w-5xl">
        <div className="mb-6">
          <Link href="/capacitaciones" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Volver a capacitaciones</Link>
        </div>

        <CapacitacionDetalle
          capacitacion={JSON.parse(JSON.stringify(capacitacion))}
          sessionRol={session.user.rol}
        />
      </div>
    </AdminSidebar>
  )
}
