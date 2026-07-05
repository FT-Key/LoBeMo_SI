import { requireAuth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { NuevoClienteForm } from "./form"
import { Navbar } from "@/components/navbar"

export default async function NuevoClientePage() {
  const session = await requireAuth()
  const puedeEditar = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "ADMINISTRACION" || session.user.rol === "VENTAS"

  if (!puedeEditar) {
    redirect("/clientes")
  }

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/clientes" />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/clientes" className="text-sm text-primary hover:underline">← Volver a clientes</Link>
          <h2 className="text-2xl font-bold mt-2">Nuevo cliente</h2>
        </div>
        <NuevoClienteForm />
      </main>
    </div>
  )
}
