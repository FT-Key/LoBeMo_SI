import { requireAuth } from "@/lib/auth-helpers"
import { CalendarioView } from "./calendario-view"
import { Navbar } from "@/components/navbar"

export default async function CalendarioPage() {
  const session = await requireAuth()

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/calendario" />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Calendario</h2>
          <p className="text-sm text-muted-foreground mt-1">Hitos y vencimientos de propuestas</p>
        </div>

        <CalendarioView />
      </main>
    </div>
  )
}
