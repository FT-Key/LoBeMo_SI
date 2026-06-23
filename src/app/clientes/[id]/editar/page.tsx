import { requireAuth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EditarClienteForm } from "./form"

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
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-md">
        <h2 className="text-2xl font-bold mb-6">Editar cliente</h2>
        <EditarClienteForm cliente={JSON.parse(JSON.stringify(cliente))} />
      </main>
    </div>
  )
}
