import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { InformeAuditoriaDetalle } from "@/components/informes-auditoria/informe-auditoria-detalle"
import { ExportarPDFButton } from "@/components/exportar/exportar-pdf-button"
import Link from "next/link"
import { NotificacionDropdown } from "@/components/notificaciones/notificacion-dropdown"
import { notFound } from "next/navigation"

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

  const rol = session.user.rol

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
            <Link href="/proyectos" className="text-sm font-medium hover:underline">Proyectos</Link>
            <Link href="/clientes" className="text-sm font-medium hover:underline">Clientes</Link>
            {rol === "GERENTE_GENERAL" && (
              <Link href="/empleados" className="text-sm font-medium hover:underline">Empleados</Link>
            )}
            <Link href="/servicios" className="text-sm font-medium hover:underline">Servicios</Link>
            <Link href="/informes-auditoria" className="text-sm font-medium hover:underline">Auditoría</Link>
            <Link href="/calendario" className="text-sm font-medium hover:underline">Calendario</Link>
            <NotificacionDropdown />
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:underline">Cerrar sesión</Link>
          </nav>
        </div>
      </header>

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
