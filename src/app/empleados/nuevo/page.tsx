import { requireGerenteGeneral } from "@/lib/auth-helpers"
import { NuevoEmpleadoForm } from "./form"

export default async function NuevoEmpleadoPage() {
  await requireGerenteGeneral()

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-md">
        <h2 className="text-2xl font-bold mb-6">Nuevo empleado</h2>
        <NuevoEmpleadoForm />
      </main>
    </div>
  )
}
