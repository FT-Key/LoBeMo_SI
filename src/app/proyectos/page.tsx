import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { ProyectosList } from "./proyectos-list"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

const ESTADO_LABELS: Record<string, string> = {
  RELEVAMIENTO: "Relevamiento",
  PROPUESTA: "Propuesta",
  APROBADO: "Aprobado",
  EN_EJECUCION: "En Ejecución",
  EN_REVISION: "En Revisión",
  ENTREGADO: "Entregado",
  CERRADO: "Cerrado",
}

export default async function ProyectosPage() {
  const session = await requireAuth()
  const puedeCrear = session.user.rol === "GERENTE_GENERAL" || session.user.rol === "CISO"

  const [proyectos, total, clientes, servicios] = await Promise.all([
    prisma.proyecto.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        cliente: { select: { id: true, razonSocial: true } },
        servicio: { select: { id: true, nombre: true } },
        _count: { select: { tareas: true, asignaciones: true, propuestas: true } },
        historialEstados: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { estadoNuevo: true, createdAt: true },
        },
      },
    }),
    prisma.proyecto.count(),
    prisma.cliente.findMany({ where: { activo: true }, orderBy: { razonSocial: "asc" }, select: { id: true, razonSocial: true } }),
    prisma.servicio.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
  ])

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/proyectos" />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Proyectos</h2>
          {puedeCrear && (
            <Link
              href="/proyectos/nuevo"
              className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Nuevo proyecto
            </Link>
          )}
        </div>

        <ProyectosList
          initialData={JSON.parse(JSON.stringify(proyectos))}
          initialTotal={total}
          clientes={JSON.parse(JSON.stringify(clientes))}
          servicios={JSON.parse(JSON.stringify(servicios))}
          estadoLabels={ESTADO_LABELS}
        />
      </main>
    </div>
  )
}
