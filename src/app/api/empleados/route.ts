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

    const { isInitialSetup } = body

    if (!isInitialSetup) {
      const session = await auth()
      if (!session?.user || session.user.rol !== "GERENTE_GENERAL") {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 })
      }
    } else {
      const existingAdmin = await prisma.empleado.findFirst({
        where: { rol: "GERENTE_GENERAL" },
      })
      if (existingAdmin) {
        return NextResponse.json(
          { error: "El superadmin ya existe" },
          { status: 400 }
        )
      }
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

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.rol !== "GERENTE_GENERAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const empleados = await prisma.empleado.findMany({
    orderBy: { createdAt: "desc" },
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
  })

  return NextResponse.json(empleados)
}
