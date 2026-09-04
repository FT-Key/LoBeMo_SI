import { requireGerenteGeneral } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { EditarEmpleadoForm } from "./form"

export default async function EditarEmpleadoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireGerenteGeneral()
  const { id } = await params

  const empleado = await prisma.empleado.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      rol: true,
      area: true,
      activo: true,
    },
  })

  if (!empleado) {
    redirect("/empleados")
  }

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/empleados">
      <div className="max-w-lg">
        <div className="mb-6">
          <Link href="/empleados" className="text-sm text-muted-foreground hover:text-foreground transition-colors">&larr; Volver a empleados</Link>
          <h2 className="text-2xl font-bold mt-2">Editar empleado</h2>
        </div>
        <EditarEmpleadoForm empleado={JSON.parse(JSON.stringify(empleado))} />
      </div>
    </AdminSidebar>
  )
}
