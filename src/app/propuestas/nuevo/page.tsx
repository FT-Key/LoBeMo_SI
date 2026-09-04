import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { NuevaPropuestaForm } from "./form"

export default async function NuevaPropuestaPage(props: {
  searchParams?: Promise<{ proyectoId?: string; recotizar?: string }>
}) {
  const session = await requireAuth()

  if (!["GERENTE_GENERAL", "ADMINISTRACION", "VENTAS"].includes(session.user.rol)) {
    redirect("/propuestas")
  }

  const searchParams = await props.searchParams
  const proyectoIdPreseleccionado = searchParams?.proyectoId ?? ""
  const recotizarId = searchParams?.recotizar ?? ""

  const proyectos = await prisma.proyecto.findMany({
    where: { estado: { in: ["RELEVAMIENTO", "PROPUESTA"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nombre: true,
      estado: true,
      cliente: { select: { razonSocial: true } },
    },
  })

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/propuestas">
      <div className="max-w-2xl">
        <div className="mb-6">
          <Link href="/propuestas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Volver a propuestas</Link>
        </div>
        <h2 className="text-2xl font-bold mb-6">
          {recotizarId ? "Recotizar propuesta" : "Nueva propuesta"}
        </h2>

        <NuevaPropuestaForm
          proyectos={JSON.parse(JSON.stringify(proyectos))}
          proyectoIdInicial={proyectoIdPreseleccionado}
          recotizarId={recotizarId}
        />
      </div>
    </AdminSidebar>
  )
}
