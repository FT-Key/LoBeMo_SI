import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function Home() {
  const hasSuperAdmin = await prisma.empleado.findFirst({
    where: { rol: "GERENTE_GENERAL" },
  })

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo Seguridad Informática</h1>
          <nav className="flex gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline">
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <h2 className="text-4xl font-bold tracking-tight mb-4">
          Sistema de Gestión de Proyectos
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mb-8">
          Centralizá la administración y seguimiento de servicios de
          ciberseguridad: clientes, proyectos, tareas y más.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Iniciar sesión
          </Link>
          {!hasSuperAdmin && (
            <Link
              href="/register"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input px-8 text-sm font-medium transition-colors hover:bg-accent"
            >
              Primer inicio
            </Link>
          )}
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} LoBeMo Seguridad Informática
        </div>
      </footer>
    </div>
  )
}
