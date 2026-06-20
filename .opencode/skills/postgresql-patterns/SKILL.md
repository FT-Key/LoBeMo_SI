---
name: postgresql-patterns
description: Patrones de integracion con PostgreSQL + Neon en Next.js: Prisma ORM, migraciones, repositorios, serverless
license: MIT
---

## Stack

- **Base de datos**: PostgreSQL en Neon (serverless)
- **ORM**: Prisma 7 (`prisma-client` generator)
- **Adapter**: `@prisma/adapter-neon` + `@neondatabase/serverless`

## Conexion a Neon (singleton)

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

## Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      String   @default("user")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}

model Project {
  id          String     @id @default(cuid())
  name        String
  description String?
  status      String     @default("active")
  clientId    String?    @map("client_id")
  client      Client?    @relation(fields: [clientId], references: [id])
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  incidents   Incident[]

  @@map("projects")
}

model Incident {
  id          String   @id @default(cuid())
  title       String
  description String?
  severity    String   @default("medium")
  status      String   @default("open")
  solution    String?
  projectId   String   @map("project_id")
  project     Project  @relation(fields: [projectId], references: [id])
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("incidents")
}
```

## Migraciones

```bash
# Generar migracion tras cambiar schema
npx prisma migrate dev --name descripcion

# Aplicar migracion a produccion
npx prisma migrate deploy

# Ver estado de migraciones
npx prisma migrate status

# Abrir Prisma Studio (navegador visual)
npx prisma studio
```

## Patron Repository (simple)

```typescript
// src/lib/repositories/project-repository.ts
import { prisma } from "@/lib/prisma"

export const projectRepository = {
  async findAll() {
    return prisma.project.findMany({
      include: { client: true, incidents: true },
      orderBy: { createdAt: "desc" },
    })
  },

  async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: { client: true, incidents: true },
    })
  },

  async create(data: { name: string; description?: string; clientId?: string }) {
    return prisma.project.create({ data })
  },

  async update(id: string, data: { name?: string; description?: string; status?: string }) {
    return prisma.project.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.project.delete({ where: { id } })
  },
}
```

Uso en route handlers:

```typescript
// app/api/projects/route.ts
import { projectRepository } from "@/lib/repositories/project-repository"

export async function GET() {
  const projects = await projectRepository.findAll()
  return Response.json({ success: true, data: projects })
}

export async function POST(req: Request) {
  const body = await req.json()
  const project = await projectRepository.create(body)
  return Response.json({ success: true, data: project }, { status: 201 })
}
```

## Neon serverless best practices

- **Pooled connection**: Usar `DATABASE_URL` de Neon (pooled) para la app; `DATABASE_URL_UNPOOLED` para migraciones
- **Cold starts**: Neon "desactiva" la BD tras inactividad (~5min). Primera query tarda ~500ms. Para evitarlo en prod, usar keep-alive
- **Limite de conexiones**: Plan gratuito permite 10 conexiones simultaneas. Usar siempre conexion pooled (`?sslmode=require`)
- **Config**: `prisma.config.ts` carga `DATABASE_URL` de `.env` via `dotenv`

## Indices y performance

```prisma
model Project {
  // ... campos

  @@index([status])
  @@index([clientId])
  @@map("projects")
}
```

## Reglas

- Importar `PrismaClient` desde `@/generated/prisma/client` (output del generator), no de `@prisma/client`
- Singleton de Prisma en `src/lib/prisma.ts` para evitar multiples conexiones en dev
- Repositories como objetos literales (no clases) para CRUD basico
- Migraciones con `prisma migrate dev` nunca SQL manual
- Timestamps `created_at` / `updated_at` en todas las tablas con `@map` para snake_case en BD
- Usar `@map` en campos y `@@map` en tablas para mantener naming consistente
- `.env` con `DATABASE_URL` de Neon; `.env.example` con placeholder
