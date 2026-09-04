import { requireAuth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EditarClienteForm } from "./form"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const puedeEditar = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "ADMINISTRACION" || session.user.rol === "VENTAS"

  if (!puedeEditar) {
    redirect("/clientes")
  }

  const { id } = await params
  const cliente = await prisma.cliente.findUnique({ where: { id } })

  if (!cliente) {
    redirect("/clientes")
  }

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/clientes">
      <div className="max-w-md">
        <h2 className="text-2xl font-bold mb-6">Editar cliente</h2>
        <EditarClienteForm cliente={JSON.parse(JSON.stringify(cliente))} />
      </div>
    </AdminSidebar>
  )
}
