import { prisma } from "@/lib/prisma"
import { requireGerenteGeneral } from "@/lib/auth-helpers"
import Link from "next/link"
import { NotificacionDropdown } from "@/components/notificaciones/notificacion-dropdown"

export default async function EmpleadosPage() {
  const session = await requireGerenteGeneral()

  const empleados = await prisma.empleado.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
            <Link href="/proyectos" className="text-sm font-medium hover:underline">Proyectos</Link>
            <Link href="/clientes" className="text-sm font-medium hover:underline">Clientes</Link>
            <Link href="/servicios" className="text-sm font-medium hover:underline">Servicios</Link>
            <Link href="/informes-auditoria" className="text-sm font-medium hover:underline">Auditoría</Link>
            <NotificacionDropdown />
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Empleados</h2>
          <Link
            href="/empleados/nuevo"
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Nuevo empleado
          </Link>
        </div>

        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 text-sm font-medium">Nombre</th>
                <th className="text-left p-3 text-sm font-medium">Email</th>
                <th className="text-left p-3 text-sm font-medium">Rol</th>
                <th className="text-left p-3 text-sm font-medium">Área</th>
                <th className="text-left p-3 text-sm font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((emp) => (
                <tr key={emp.id} className="border-b last:border-0">
                  <td className="p-3 text-sm">
                    {emp.nombre} {emp.apellido}
                  </td>
                  <td className="p-3 text-sm">{emp.email}</td>
                  <td className="p-3 text-sm">{emp.rol}</td>
                  <td className="p-3 text-sm">{emp.area}</td>
                  <td className="p-3 text-sm">
                    {emp.activo ? (
                      <span className="text-green-600">Activo</span>
                    ) : (
                      <span className="text-red-600">Inactivo</span>
                    )}
                  </td>
                </tr>
              ))}
              {empleados.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                    No hay empleados registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
