import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
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
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/propuestas" />

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
