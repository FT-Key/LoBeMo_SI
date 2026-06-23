# Workflow State

## Request
Sistema de gestión de proyectos para LoBeMo Seguridad Informática — empresa de ciberseguridad con 11 empleados en Tucumán, NOA. Sistema web interno single-tenant para administrar clientes, proyectos (con flujo de 7 estados), propuestas, asignación de empleados, tareas, hitos, documentos, notificaciones y dashboard ejecutivo.

## Clarified Scope
- **IN:** Gestión de empleados (11 roles), clientes, proyectos con ciclo de vida completo, propuestas, tareas, asignaciones, hitos, documentos, notificaciones, dashboard ejecutivo, audit log, reportes de pentesting y auditoría, gestión de capacitaciones.
- **OUT:** Facturación electrónica/AFIP, pasarela de pagos, multi-tenancy, app móvil nativa, integración con email (post-MVP), calendario externo.
- **MVP:** US-001 a US-009 (autenticación, clientes, servicios, proyectos, propuestas, asignaciones, tareas, hitos, dashboard).
- **Stack:** Next.js 15 App Router + Prisma + PostgreSQL (Neon) + Auth.js v5 + TanStack Query + Tailwind CSS/shadcn/ui + Hexagonal Architecture + DDD.
- **Deploy:** Vercel + GitHub (repositorio privado).

## Current US
- **ID**: US-010
- **Card**: O8Qb1S6D
- **Status**: In Progress
- **Phase**: P2 - Implement
- **Detail**: Carga y gestión de documentos

## History
| US | Status | Branch | PR | Detail |
|----|--------|--------|----|--------|
| US-001 | ✅ Done | feat/US-001-autenticacion | PR #1 → dev, PR #2 → main | .opencode/workflow/history/US-001.md |
| US-021 | ✅ Done | feat/US-021-landing-page | PR #4 → dev | .opencode/workflow/history/US-021.md |
| US-002 | ✅ Done | feat/US-002-gestion-clientes | PR #5 → dev | .opencode/workflow/history/US-002.md |
| US-003 | ✅ Done | feat/US-003-registro-servicios | PR #6 → dev | .opencode/workflow/history/US-003.md |
| US-004 | ✅ Done | feat/US-004-ciclo-vida-proyecto | PR #7 → dev | .opencode/workflow/history/US-004.md |
| US-005 | ✅ Done | feat/US-005-gestion-propuestas | PR #8 → dev | .opencode/workflow/history/US-005.md |
| US-006 | ✅ Done | feat/US-006-asignaciones | PR #9 → dev | .opencode/workflow/history/US-006.md |
| US-007 | ✅ Done | feat/US-007-gestion-tareas | PR #10 → dev | .opencode/workflow/history/US-007.md |
| US-008 | ✅ Done | feat/US-008-gestion-hitos | PR #11 → dev | .opencode/workflow/history/US-008.md |

## Lint Results
### Linter
- **Comando**: `npm run lint` → Falló (ESLint no encontrado)
- **Causa**: `node_modules/` está vacío — no se ha ejecutado `npm install`
- **Errores detectables**: Dependencias no instaladas (eslint, next, typescript, etc.)
- **Auto-fix aplicado**: No (imposible sin node_modules)

### Typecheck
- **Comando**: `npm run typecheck` → Falló (script no existe en package.json)
- **Causa**: No hay script "typecheck" configurado; `npx tsc --noEmit` no disponible por restricciones de seguridad
- **Errores detectables**: Ver análisis estático abajo

### Detalle de errores detectados por análisis estático

#### 1. Dependencias no instaladas (BLOQUEANTE)
- `node_modules/` está completamente vacío
- No es posible ejecutar ESLint, TypeScript compiler ni Prisma generate
- **Acción requerida**: Ejecutar `npm install` seguido de `prisma generate`

#### 2. Archivos de tipo generado faltantes
- `src/lib/prisma.ts` línea 1: `import { PrismaClient } from "@/generated/prisma/client"`
  - El directorio `src/generated/prisma/` no existe hasta ejecutar `npx prisma generate`
  - Sin este paso, TypeScript no encuentra el tipo `PrismaClient` y todos los archivos que lo importan fallan

#### 3. `src/app/proyectos/[id]/proyecto-detalle.tsx` — Type safety débil
- **Línea 99**: `proyecto: Record<string, unknown>`
  - El tipo `Record<string, unknown>` es demasiado genérico. No permite acceso seguro a propiedades.
- **Líneas 112-140**: Type assertion masiva (`proyecto as { ... }`)
  - Se asume la forma completa del objeto sin verificación en tiempo de compilación.
  - Si la data real difiere del tipo declarado, se producen errores runtime.
  - **Sugerencia**: Definir un tipo/interfaz `ProyectoDetalleData` exportado desde un archivo de tipos y usarlo tanto en la prop como en el server component.

#### 4. `src/app/api/documentos/route.ts` — Tipos `ReadonlyArray`
- **Línea 5-13**: `TIPOS_DOCUMENTO` es `as const` → tipo `readonly ["INFORME_AUDITORIA", ..., "OTRO"]`
- **Línea 85**: `TIPOS_DOCUMENTO.includes(tipo)` donde `tipo: string`
  - TypeScript strict puede quejarse porque `.includes()` en un `ReadonlyArray` espera un tipo compatible con los elementos.
  - En TypeScript 5+, `includes` en readonly tuples acepta `string`, pero puede requerir un cast explícito en configs más estrictas.

#### 5. `src/app/api/documentos/route.ts` — Parámetro no usado
- **Línea 23**: `GET(request: NextRequest)` — `request` no se usa directamente (se extrae via `new URL(request.url)`)
  - ESLint con `@typescript-eslint/no-unused-vars` podría marcar `request` si la regla está activa (similar a `_request` usado en `[id]/route.ts`)

#### 6. `src/app/api/documentos/[id]/route.ts` — Patrón correcto
- Uso de `_request` con underscore: correcto para Next.js 16 params
- `params: Promise<{ id: string }>` y `await params`: patrón correcto para Next.js 16

#### 7. `src/app/proyectos/[id]/page.tsx` — Serialización Prisma
- **Líneas 86, 90**: `JSON.parse(JSON.stringify(proyecto))`
  - Funcional, pero puede tener impacto en performance para objetos grandes
  - Alternativa: `prisma.$disconnect()` o usar `structuredClone()` en Node 17+

#### 8. `src/app/proyectos/[id]/proyecto-detalle.tsx` — Posible error en estado de transición
- **Línea 147**: `puedeTransicionar` solo para roles específicos, pero la UI permite transiciones mediante botones
- **Línea 211**: `transicionesPosibles[p.estado] ?? []` — correcto con fallback

#### 9. `src/app/proyectos/[id]/proyecto-detalle.tsx` — Fragment dentro de <p>
- **Líneas 1197-1201**: `<p>` contiene `<><span>...</span> → <span>...</span></>`
  - Los Fragmentos (`<></>`) dentro de elementos de bloque son válidos en React pero si los estilos CSS de `p` esperan solo contenido inline, puede haber problemas de renderizado. No es un error de compilación.

#### 10. Archivos sin errores detectables
- `src/app/api/documentos/route.ts`: Lógica correcta, validaciones adecuadas (tamaño, tipo MIME, permisos)
- `src/app/api/documentos/[id]/route.ts`: CRUD completo con auditoría, correcto
- `src/app/proyectos/[id]/page.tsx`: Server component bien estructurado

### Resumen
| Ítem | Estado |
|------|--------|
| Ejecución de linter | ❌ No ejecutable (node_modules vacío) |
| Ejecución de typecheck | ❌ No ejecutable (sin script, sin node_modules) |
| Errores bloqueantes | 2 (node_modules vacío, prisma generate pendiente) |
| Issues de tipo estático | 4 (type safety débil, readonly array, parámetro no usado, serialización) |
| Advertencias | 2 (fragment en p, performance serialización) |

## Project Status
✅ Fase de análisis de requisitos COMPLETA.
✅ TP1 y TP2 leídos y procesados.
✅ Modelo de dominio definido (10 entidades + audit_log).
✅ 15 reglas de negocio (RN-01 a RN-15).
✅ 64 requerimientos funcionales (RF-01 a RF-64).
✅ 12 requerimientos no funcionales (RNF-01 a RNF-12).
✅ 20 User Stories (9 MVP, 6 Should, 5 Could).
✅ Repositorio GitHub creado: https://github.com/FT-Key/LoBeMo_SI
✅ Tablero Trello creado: https://trello.com/b/Bjj0onFq
✅ **US-001 implementada y mergeada a main.**
✅ **US-002 implementada y mergeada a dev.**
✅ **US-003 implementada y mergeada a dev.**
✅ **US-004 implementada y mergeada a dev.**
✅ **US-005 implementada y mergeada a dev.**

### Cards en Trello (Backlog)
| # | US | Prioridad | Card ID | Trello Link |
|---|----|-----------|---------|-------------|
| 1 | US-001 | 🔴 Must Have | hYi3vqEW | https://trello.com/c/hYi3vqEW |
| 2 | US-002 | 🔴 Must Have | FAbNQI14 | https://trello.com/c/FAbNQI14 |
| 3 | US-003 | 🔴 Must Have | dSPqRz26 | https://trello.com/c/dSPqRz26 |
| 4 | US-004 | 🔴 Must Have | yGzyxinV | https://trello.com/c/yGzyxinV |
| 5 | US-005 | 🔴 Must Have | 9DjqkFd9 | https://trello.com/c/9DjqkFd9 |
| 6 | US-006 | 🔴 Must Have | 2WYnyUdd | https://trello.com/c/2WYnyUdd |
| 7 | US-007 | 🔴 Must Have | xkZCHFAf | https://trello.com/c/xkZCHFAf |
| 8 | US-008 | 🔴 Must Have | z770Gnm5 | https://trello.com/c/z770Gnm5 |
| 9 | US-009 | 🔴 Must Have | GnktmlPH | https://trello.com/c/GnktmlPH |
| 10 | US-010 | 🟡 Should Have | O8Qb1S6D | https://trello.com/c/O8Qb1S6D |
| 11 | US-011 | 🟡 Should Have | iYwTejJ5 | https://trello.com/c/iYwTejJ5 |
| 12 | US-012 | 🟡 Should Have | yQ0wyJHI | https://trello.com/c/yQ0wyJHI |
| 13 | US-013 | 🟡 Should Have | vMgEsgSd | https://trello.com/c/vMgEsgSd |
| 14 | US-014 | 🟡 Should Have | FgFoCQxp | https://trello.com/c/FgFoCQxp |
| 15 | US-015 | 🟡 Should Have | abmIgfGU | https://trello.com/c/abmIgfGU |
| 16 | US-016 | 🟢 Could Have | hTdJkq5h | https://trello.com/c/hTdJkq5h |
| 17 | US-017 | 🟢 Could Have | 5IUiy7g1 | https://trello.com/c/5IUiy7g1 |
| 18 | US-018 | 🟢 Could Have | 6CM9TbsT | https://trello.com/c/6CM9TbsT |
| 19 | US-019 | 🟢 Could Have | nXCzTJh8 | https://trello.com/c/nXCzTJh8 |
| 20 | US-020 | 🟢 Could Have | 70jfVId9 | https://trello.com/c/70jfVId9 |
| 21 | US-021 | 🔴 Must Have | hCrnRlEZ | https://trello.com/c/hCrnRlEZ |

## Current Phase
### US-010 — Carga y gestión de documentos
- **Phase**: P2 - Implement
- **Status**: API routes y UI de documentos implementados
