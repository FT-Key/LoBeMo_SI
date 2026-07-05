import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { InformeAuditoriaDetalle } from "@/components/informes-auditoria/informe-auditoria-detalle"
import { ExportarPDFButton } from "@/components/exportar/exportar-pdf-button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"

export default async function InformeAuditoriaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const { id } = await params

  const informe = await prisma.informeAuditoria.findUnique({
    where: { id },
    include: {
      proyecto: {
        select: {
          id: true,
          nombre: true,
          estado: true,
          cliente: { select: { id: true, razonSocial: true } },
        },
      },
      creador: { select: { id: true, nombre: true, apellido: true, rol: true } },
    },
  })

  if (!informe) {
    notFound()
  }

  const esCreador = informe.creadorId === session.user.id
  const esGerenteOCiso = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"
  if (!esCreador && !esGerenteOCiso) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No autorizado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/informes-auditoria" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/informes-auditoria" className="text-sm text-primary hover:underline">← Volver a informes</Link>
          <ExportarPDFButton url={`/api/exportar/informe-auditoria/${id}`} label="Exportar PDF" />
        </div>

        <InformeAuditoriaDetalle
          informe={JSON.parse(JSON.stringify(informe))}
          sessionRol={session.user.rol}
          sessionUserId={session.user.id}
        />
      </main>
    </div>
  )
}
