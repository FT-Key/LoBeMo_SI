import { requireAuth } from "@/lib/auth-helpers"
import { CalendarioView } from "./calendario-view"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function CalendarioPage() {
  const session = await requireAuth()

  return (
    <AdminSidebar name={session.user.name} rol={session.user.rol} currentPath="/calendario">
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Calendario</h1>
          <p className="text-sm text-muted-foreground mt-1">Hitos y vencimientos de propuestas</p>
        </div>

        <CalendarioView />
      </div>
    </AdminSidebar>
  )
}
