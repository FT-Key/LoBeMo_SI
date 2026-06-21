import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isGG = session.user.rol === "GERENTE_GENERAL"

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
          <nav className="flex items-center gap-4">
            <Link href="/clientes" className="text-sm font-medium hover:underline">
              Clientes
            </Link>
            {isGG && (
              <Link href="/empleados" className="text-sm font-medium hover:underline">
                Empleados
              </Link>
            )}
            <Link href="/servicios" className="text-sm font-medium hover:underline">
              Servicios
            </Link>
            <span className="text-sm text-muted-foreground">
              {session.user.name}
            </span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-muted-foreground hover:underline"
            >
              Cerrar sesión
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <p className="text-muted-foreground">
          Bienvenido, {session.user.name}. Panel en construcción.
        </p>
      </main>
    </div>
  )
}
