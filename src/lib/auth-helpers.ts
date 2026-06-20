import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }
  return session
}

export async function requireGerenteGeneral() {
  const session = await requireAuth()
  if (session.user.rol !== "GERENTE_GENERAL") {
    redirect("/dashboard")
  }
  return session
}
