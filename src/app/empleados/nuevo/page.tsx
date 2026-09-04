import { requireGerenteGeneral } from "@/lib/auth-helpers"
import Link from "next/link"
import { NuevoEmpleadoForm } from "./form"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function NuevoEmpleadoPage() {
  const session = await requireGerenteGeneral()

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/empleados">
      <div className="max-w-lg">
        <div className="mb-6">
          <Link href="/empleados" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Volver a empleados</Link>
          <h2 className="text-2xl font-bold mt-2">Nuevo empleado</h2>
        </div>
        <NuevoEmpleadoForm />
      </div>
    </AdminSidebar>
  )
}
