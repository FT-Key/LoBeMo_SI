import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

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
  const { configuraciones } = body as {
    configuraciones: { clave: string; valor: string }[]
  }

  if (!Array.isArray(configuraciones) || configuraciones.length === 0) {
    return NextResponse.json({ error: "Se requiere al menos una configuración" }, { status: 400 })
  }

  const CLAVES_VALIDAS = [
    "MAX_PROYECTOS_ACTIVOS_POR_EMPLEADO",
    "DIAS_AVISO_VENCIMIENTO_PROPUESTA",
    "DIAS_AVISO_HITO",
  ]

  for (const c of configuraciones) {
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
  for (const c of configuraciones) {
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
      detalle: { configuraciones },
      empleadoId: session.user.id,
    },
  })

  return NextResponse.json({ data: results })
}
