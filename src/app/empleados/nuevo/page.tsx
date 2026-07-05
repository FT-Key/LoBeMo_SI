import { requireGerenteGeneral } from "@/lib/auth-helpers"
import Link from "next/link"
import { NuevoEmpleadoForm } from "./form"
import { Navbar } from "@/components/navbar"

export default async function NuevoEmpleadoPage() {
  const session = await requireGerenteGeneral()

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/empleados" />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/empleados" className="text-sm text-primary hover:underline">← Volver a empleados</Link>
          <h2 className="text-2xl font-bold mt-2">Nuevo empleado</h2>
        </div>
        <NuevoEmpleadoForm />
      </main>
    </div>
  )
}
