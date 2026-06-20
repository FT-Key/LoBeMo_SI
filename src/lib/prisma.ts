import { PrismaClient } from "@/generated/prisma/client"
import { PrismaNeonHttp } from "@prisma/adapter-neon"
import type { HTTPQueryOptions } from "@neondatabase/serverless"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createClient() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL no definida")
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL, {} as HTTPQueryOptions<boolean, boolean>)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
