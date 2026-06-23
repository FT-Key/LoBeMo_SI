import { requireAuth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { NuevoClienteForm } from "./form"

export default async function NuevoClientePage() {
  const session = await requireAuth()
  const puedeEditar = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "ADMINISTRACION" || session.user.rol === "VENTAS"

  if (!puedeEditar) {
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
        <h2 className="text-2xl font-bold mb-6">Nuevo cliente</h2>
        <NuevoClienteForm />
      </main>
    </div>
  )
}
