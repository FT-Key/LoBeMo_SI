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
- **ID**: US-004
- **Card**: yGzyxinV
- **Status**: ✅ Done
- **Phase**: P5 - Git + PR
- **Detail**: Creación y ciclo de vida del proyecto

## History
| US | Status | Branch | PR | Detail |
|----|--------|--------|----|--------|
| US-001 | ✅ Done | feat/US-001-autenticacion | PR #1 → dev, PR #2 → main | .opencode/workflow/history/US-001.md |
| US-021 | ✅ Done | feat/US-021-landing-page | PR #4 → dev | .opencode/workflow/history/US-021.md |
| US-002 | ✅ Done | feat/US-002-gestion-clientes | PR #5 → dev | .opencode/workflow/history/US-002.md |
| US-003 | ✅ Done | feat/US-003-registro-servicios | PR #6 → dev | .opencode/workflow/history/US-003.md |
| US-004 | 🚧 In Progress | feat/US-004-ciclo-vida-proyecto | — | .opencode/workflow/history/US-004.md |

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
✅ **US-004 implementada (en PR a dev).**

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
1. **[PRÓXIMA] US-005: Gestión de propuestas**
