import { prisma } from "./prisma"

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function randomChars(length: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function generarCodigoProyecto(nombre: string): Promise<string> {
  const slug = slugify(nombre)
  const prefix = slug.slice(0, 4).padEnd(4, "X")

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = randomChars(4)
    const codigo = `LBM-${prefix.toUpperCase()}-${suffix}`

    const existing = await prisma.proyecto.findUnique({ where: { codigo } })
    if (!existing) return codigo
  }

  throw new Error("No se pudo generar un código único para el proyecto")
}

export function formatCodigoDisplay(codigo: string): string {
  return codigo
}
