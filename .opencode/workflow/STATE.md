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
- **ID**: —
- **Card**: —
- **Status**: —
- **Phase**: —
- **Detail**: —

## History
| US | Status | Branch | PR | Detail |
|----|--------|--------|----|--------|
| US-001 | ✅ Done | feat/US-001-autenticacion | PR #1 → dev, PR #2 → main | .opencode/workflow/history/US-001.md |
| US-021 | ✅ Done | feat/US-021-landing-page | PR #4 → dev | .opencode/workflow/history/US-021.md |
| US-002 | ✅ Done | feat/US-002-gestion-clientes | PR #5 → dev | .opencode/workflow/history/US-002.md |

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

## Next Steps
1. **[EN REVISIÓN] US-003: Registro de servicios** — Code review completado con bloqueantes.
   - ❌ AC-03: Frontend/Backend mismatch en delete eligibility
   - ❌ PATCH sin validación de inputs
   - Ver Trello card para detalle completo.

## Review Findings

### Bloqueantes

1. **Frontend/Backend mismatch on delete eligibility (AC-03)**
   - **Archivos**: `servicios-list.tsx:188`, `servicios/[id]/route.ts:103-105`
   - Backend checks only non-CERRADO projects before allowing deletion. Frontend checks `s._count.proyectos === 0` (ALL projects, including CERRADO). A service with 2 closed projects shows `_count = 2`, hiding the "Eliminar" button even though the API would allow deletion.
   - **Fix**: Use a filtered count: `_count: { select: { proyectos: { where: { estado: { not: "CERRADO" } } } } }` in the server query so frontend matches backend logic. The project count column should also reflect "active projects" or be adjusted.

2. **No input validation on PATCH endpoint**
   - **Archivo**: `servicios/[id]/route.ts:44-46`
   - `descripcion` and `precioBase` accepted without type/schema validation. Sending `{ descripcion: { nested: "object" } }` or `{ precioBase: "not-a-number" }` causes unhandled Prisma errors → 500 response.
   - **Fix**: Add validation guards:
     ```ts
     if (descripcion !== undefined && typeof descripcion !== "string") {
       return NextResponse.json({ error: "Descripción inválida" }, { status: 400 })
     }
     if (precioBase !== undefined && precioBase !== null && typeof precioBase !== "number") {
       return NextResponse.json({ error: "Precio base inválido" }, { status: 400 })
     }
     ```

### Recomendaciones

1. **Navigation "Empleados" link inconsistency** (`servicios/page.tsx:27` vs `clientes/page.tsx:26`)
   - Servicios page: visible solo para GERENTE_GENERAL. Clientes page: visible para GERENTE_GENERAL | ADMINISTRACION | VENTAS. Unificar criterios entre páginas.

2. **`editPrecio` falsy edge case** (`servicios-list.tsx:75`)
   - `editPrecio ? parseFloat(editPrecio) : null` — typing `0` sends `null` because `0` is falsy. Use `editPrecio !== "" ? parseFloat(editPrecio) : null` instead.

3. **Search without debounce** (`servicios-list.tsx:112`)
   - API call on every keystroke. Add 300ms debounce (same pattern exists in clientes-list.tsx — pre-existing).

4. **Hardcoded `take: 10`** (`servicios/page.tsx:13`)
   - Limit duplicated in server and client. Extract to shared constant in both endpoints.

5. **`Record<string, unknown>` type safety** (`servicios/route.ts:16`, `servicios/[id]/route.ts:53`)
   - Pre-existing pattern from clientes, but loses TypeScript safety. Use `Prisma.ServicioWhereInput` / `Prisma.ServicioUpdateInput` instead.

### AC Verification Summary
| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-01: 6 servicios predefinidos | ✅ | Seeded correctamente con nombres y descripciones |
| AC-02: Editar descripción y precio base | ⚠️ | Funciona, pero falta validación de inputs (Bloqueante #2) |
| AC-03: No eliminar con proyectos asociados | ⚠️ | Backend correcto, frontend bloquea incorrectamente (Bloqueante #1) |
| AuditLog en UPDATE/DELETE | ✅ | Registrado correctamente |
| Solo GERENTE_GENERAL edita/elimina | ✅ | Backend enforce correcto |
| Consistencia con API clientes | ✅ | Mismos patrones de paginación, auth, error handling |
