import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { validateBody } from "@/lib/api-validate"
import { createEmpleadoSchema } from "@/shared/validation"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = validateBody(createEmpleadoSchema, body)
    if (!result.success) return result.error

    const session = await auth()
    if (!session?.user || session.user.rol !== "GERENTE_GENERAL") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const existing = await prisma.empleado.findUnique({ where: { email: result.data.email } })
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un empleado con ese email" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(result.data.password, 12)

    const empleado = await prisma.empleado.create({
      data: {
        nombre: result.data.nombre,
        apellido: result.data.apellido,
        email: result.data.email,
        password: hashedPassword,
        rol: result.data.rol,
        area: result.data.area,
      },
    })

    await prisma.auditLog.create({
      data: {
        accion: "CREATE",
        entidad: "Empleado",
        entidadId: empleado.id,
        detalle: { email: result.data.email, rol: result.data.rol },
      },
    })

    return NextResponse.json(
      { id: empleado.id, nombre: empleado.nombre, email: empleado.email, rol: empleado.rol },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.rol !== "GERENTE_GENERAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")))
  const search = searchParams.get("search") ?? ""
  const rol = searchParams.get("rol") ?? ""
  const area = searchParams.get("area") ?? ""
  const activo = searchParams.get("activo") ?? ""

  const where: Record<string, unknown> = {}
  if (rol) where.rol = rol
  if (area) where.area = area
  if (activo === "true") where.activo = true
  if (activo === "false") where.activo = false
  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: "insensitive" } },
      { apellido: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  const [empleados, total] = await Promise.all([
    prisma.empleado.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        rol: true,
        area: true,
        activo: true,
        fechaIngreso: true,
      },
    }),
    prisma.empleado.count({ where }),
  ])

  return NextResponse.json({
    data: empleados,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}
