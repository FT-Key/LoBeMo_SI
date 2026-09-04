import { requireAuth } from "@/lib/auth-helpers"
import { redirect } from "next/navigation"
import { readdir, readFile } from "fs/promises"
import { join } from "path"
import { Navbar } from "@/components/navbar"
import { ManualView } from "./manual-view"

const MANUALS_DIR = join(process.cwd(), "src", "content", "manuals")

interface ManualFile {
  slug: string
  title: string
  content: string
}

function formatTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default async function ManualPage() {
  const session = await requireAuth()
  if (session.user.rol !== "GERENTE_GENERAL") {
    redirect("/dashboard")
  }

  let manuals: ManualFile[] = []
  try {
    const files = await readdir(MANUALS_DIR)
    const mdFiles = files.filter((f) => f.endsWith(".md"))

    manuals = await Promise.all(
      mdFiles.map(async (file) => {
        const slug = file.replace(".md", "")
        const filePath = join(MANUALS_DIR, file)
        const content = await readFile(filePath, "utf-8")
        return {
          slug,
          title: formatTitle(slug),
          content,
        }
      })
    )
  } catch {
    manuals = []
  }

  return (
    <div className="min-h-screen">
      <Navbar name={session.user.name} rol={session.user.rol} currentPath="/admin/manual" />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Manuales del Sistema</h2>
        <ManualView manuals={manuals} />
      </main>
    </div>
  )
}
