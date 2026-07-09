import { prisma } from "@/lib/prisma"
import { requireGerenteGeneral } from "@/lib/auth-helpers"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { EmpleadosContent } from "./empleados-content"

export default async function EmpleadosPage() {
  const session = await requireGerenteGeneral()

  const empleados = await prisma.empleado.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/empleados" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Empleados</h2>
          <Link
            href="/empleados/nuevo"
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Nuevo empleado
          </Link>
        </div>

        <EmpleadosContent empleados={JSON.parse(JSON.stringify(empleados))} />
      </main>
    </div>
  )
}
