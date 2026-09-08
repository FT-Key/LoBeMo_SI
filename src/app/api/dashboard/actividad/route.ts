import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withRole, ROLES } from "@/lib/api-auth"
import { logger } from "@/lib/logger"

export const GET = withRole(ROLES.VIEW_DASHBOARD, async () => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        empleado: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
      },
    })

    return NextResponse.json({ data: logs })
  } catch (error) {
    logger.error({ err: error }, "Error fetching dashboard activity")
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
})
