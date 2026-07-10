import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { validateBody } from "@/lib/api-validate"

const configItemSchema = z.object({
  clave: z.string().min(1, "La clave es obligatoria"),
  valor: z.string().min(1, "El valor es obligatorio"),
})

const updateConfigSchema = z.object({
  configuraciones: z.array(configItemSchema).min(1, "Se requiere al menos una configuración"),
})

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.rol !== "GERENTE_GENERAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const configs = await prisma.configuracion.findMany({
    orderBy: { clave: "asc" },
  })

  return NextResponse.json({ data: configs })
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.rol !== "GERENTE_GENERAL") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const body = await request.json()
  const result = validateBody(updateConfigSchema, body)
  if (!result.success) return result.error

  const CLAVES_VALIDAS = [
    "MAX_PROYECTOS_ACTIVOS_POR_EMPLEADO",
    "DIAS_AVISO_VENCIMIENTO_PROPUESTA",
    "DIAS_AVISO_HITO",
  ]

  for (const c of result.data.configuraciones) {
    if (!CLAVES_VALIDAS.includes(c.clave)) {
      return NextResponse.json({ error: `Clave inválida: ${c.clave}` }, { status: 400 })
    }
    const num = Number(c.valor)
    if (isNaN(num) || num < 1 || num > 100) {
      return NextResponse.json(
        { error: `"${c.clave}" debe ser un número entre 1 y 100` },
        { status: 400 }
      )
    }
  }

  const results = []
  for (const c of result.data.configuraciones) {
    const updated = await prisma.configuracion.upsert({
      where: { clave: c.clave },
      update: { valor: c.valor },
      create: { clave: c.clave, valor: c.valor },
    })
    results.push(updated)
  }

  await prisma.auditLog.create({
    data: {
      accion: "UPDATE",
      entidad: "Configuracion",
      entidadId: "all",
      detalle: { configuraciones: result.data.configuraciones },
      empleadoId: session.user.id,
    },
  })

  return NextResponse.json({ data: results })
}
