import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { RegisterForm } from "./register-form"

export const dynamic = "force-dynamic"

export default async function RegisterPage() {
  const existingAdmin = await prisma.empleado.findFirst({
    where: { rol: "GERENTE_GENERAL" },
  })

  if (existingAdmin) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">LoBeMo Seguridad Informática</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Registrar superadmin inicial
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
