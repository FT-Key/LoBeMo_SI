import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AdminView } from "./admin-view"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

const CLAVES_LABELS: Record<string, { label: string; descripcion: string }> = {
  MAX_PROYECTOS_ACTIVOS_POR_EMPLEADO: {
    label: "Máximo proyectos activos por empleado",
    descripcion: "Límite de proyectos simultáneos (EN_EJECUCION o EN_REVISION) que un empleado puede tener (RN-08)",
  },
  DIAS_AVISO_VENCIMIENTO_PROPUESTA: {
    label: "Días de aviso para vencimiento de propuestas",
    descripcion: "Anticipación en días para notificar que una propuesta está próxima a vencer (RN-15c)",
  },
  DIAS_AVISO_HITO: {
    label: "Días de aviso para hitos",
    descripcion: "Anticipación en días para notificar la fecha prevista de un hito",
  },
}

export default async function AdminPage() {
  const session = await requireAuth()

  if (session.user.rol !== "GERENTE_GENERAL") {
    redirect("/dashboard")
  }

  const configs = await prisma.configuracion.findMany({
    orderBy: { clave: "asc" },
  })

  const configMap: Record<string, string> = {}
  for (const c of configs) {
    configMap[c.clave] = c.valor
  }

  const defaults: Record<string, string> = {
    MAX_PROYECTOS_ACTIVOS_POR_EMPLEADO: "3",
    DIAS_AVISO_VENCIMIENTO_PROPUESTA: "3",
    DIAS_AVISO_HITO: "3",
  }

  const merged = { ...defaults, ...configMap }
  const items = Object.entries(CLAVES_LABELS).map(([clave, meta]) => ({
    clave,
    valor: merged[clave] ?? defaults[clave],
    ...meta,
  }))

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/admin">
      <AdminView initialItems={items} />
    </AdminSidebar>
  )
}
