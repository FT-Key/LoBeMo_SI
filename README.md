# LoBeMo Seguridad Informática

Sistema de Gestión de Proyectos de Ciberseguridad.

Empresa tucumana especializada en ciberseguridad con 11 colaboradores. Este sistema web interno administra el ciclo de vida completo de proyectos de seguridad informática: desde el relevamiento inicial hasta el cierre, incluyendo propuestas, asignación de recursos, tareas, hitos, documentos y dashboard ejecutivo.

## Stack Tecnológico

- **Frontend:** Next.js 15 App Router + Tailwind CSS + shadcn/ui + TanStack Query
- **Backend:** Next.js API Routes (arquitectura hexagonal)
- **Base de Datos:** PostgreSQL serverless (Neon) + Prisma ORM
- **Autenticación:** Auth.js v5
- **Deploy:** Vercel
- **Idioma:** Español (Argentina)

## Estructura del Proyecto

```
src/
├── domain/       # Entidades, reglas de negocio, puertos (interfaces)
├── application/  # Casos de uso, DTOs
├── infrastructure/ # Adaptadores, repositorios, servicios externos
└── presentation/ # Componentes Next.js, páginas, API routes
```

## Estado del Proyecto

En fase inicial de implementación. Primer MVP: US-001 a US-009.
