import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { PropuestaDetalle } from "./propuesta-detalle"

const ESTADO_PROPUESTA_LABELS: Record<string, string> = {
  ENVIADA: "Enviada",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
  RECOTIZADA: "Recotizada",
}

export default async function PropuestaDetallePage(props: { params: Promise<{ id: string }> }) {
  const session = await requireAuth()
  const { id } = await props.params

  const propuesta = await prisma.propuesta.findUnique({
    where: { id },
    include: {
      proyecto: {
        include: {
          cliente: { select: { id: true, razonSocial: true, cuit: true } },
          servicio: { select: { id: true, nombre: true } },
        },
      },
    },
  })

  if (!propuesta) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">LoBeMo</h1>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">Dashboard</Link>
            <Link href="/propuestas" className="text-sm font-medium hover:underline">Propuestas</Link>
            <Link href="/proyectos" className="text-sm font-medium hover:underline">Proyectos</Link>
            <Link href="/clientes" className="text-sm font-medium hover:underline">Clientes</Link>
            <span className="text-sm text-muted-foreground">{session.user.name}</span>
            <Link href="/api/auth/signout" className="text-sm text-muted-foreground hover:underline">Cerrar sesión</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/propuestas" className="text-sm text-muted-foreground hover:underline">&larr; Volver a propuestas</Link>
        </div>

        <PropuestaDetalle
          propuesta={JSON.parse(JSON.stringify(propuesta))}
          sessionRol={session.user.rol}
          estadoLabels={ESTADO_PROPUESTA_LABELS}
        />
      </main>
    </div>
  )
}
