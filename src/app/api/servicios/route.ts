import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
  const search = searchParams.get("search") ?? ""

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: "insensitive" } },
      { descripcion: { contains: search, mode: "insensitive" } },
    ]
  }

  const [servicios, total] = await Promise.all([
    prisma.servicio.findMany({
      where,
      orderBy: { nombre: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { proyectos: true } } },
    }),
    prisma.servicio.count({ where }),
  ])

  return NextResponse.json({
    data: servicios,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
