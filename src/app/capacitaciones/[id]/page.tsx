import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { CapacitacionDetalle } from "@/components/capacitaciones/capacitacion-detalle"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No autorizado</p>
      </div>
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
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/capacitaciones" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/capacitaciones" className="text-sm text-primary hover:underline">← Volver a capacitaciones</Link>
        </div>

        <CapacitacionDetalle
          capacitacion={JSON.parse(JSON.stringify(capacitacion))}
          sessionRol={session.user.rol}
        />
      </main>
    </div>
  )
}
