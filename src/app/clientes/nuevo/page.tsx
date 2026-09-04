import { requireAuth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { NuevoClienteForm } from "./form"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function NuevoClientePage() {
  const session = await requireAuth()
  const puedeEditar = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "ADMINISTRACION" || session.user.rol === "VENTAS"

  if (!puedeEditar) {
    redirect("/clientes")
  }

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/clientes">
      <div className="max-w-md">
        <div className="mb-6">
          <Link href="/clientes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Volver a clientes</Link>
          <h2 className="text-2xl font-bold mt-2">Nuevo cliente</h2>
        </div>
        <NuevoClienteForm />
      </div>
    </AdminSidebar>
  )
}
