# Workflow State

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
| US-009 | ✅ Done | feat/US-009-dashboard-ejecutivo | PR #12 → dev | .opencode/workflow/history/US-009.md |
| US-010 | ✅ Done | feat/US-010-gestion-documentos | PR #13 → dev | .opencode/workflow/history/US-010.md |
| US-011 | ✅ Done | feat/US-011-sistema-notificaciones | PR #14 → dev | .opencode/workflow/history/US-011.md |
| US-012 | ✅ Done | feat/US-012-informes-auditoria | PR #15 → dev | .opencode/workflow/history/US-012.md |
| US-013 | ✅ Done | — | Quality fixes applied to dev | .opencode/workflow/history/US-013.md |
| US-014 | ✅ Done | feat/US-014-hallazgos-pentesting | PR #17 → dev | .opencode/workflow/history/US-014.md |
| US-015 | ✅ Done | feat/US-015-audit-log | PR → dev | .opencode/workflow/history/US-015.md |
| US-016 | ✅ Done | feat/US-016-soporte-tecnico | PR #19 → dev | .opencode/workflow/history/US-016.md |
| US-017 | ✅ Done | feat/US-016-soporte-tecnico | PR #19 → dev | .opencode/workflow/history/US-017.md |
| US-018 | ✅ Done | feat/US-018-exportacion-pdf | PR #20 → dev | .opencode/workflow/history/US-018.md |
| US-019 | ✅ Done | feat/US-019-calendario | PR #21 → dev | .opencode/workflow/history/US-019.md |
| US-020 | ✅ Done | feat/US-020-admin-panel | PR #22 → dev | .opencode/workflow/history/US-020.md |
| US-022 | ✅ Done | feat/US-022-quality-fixes | PR #23 → dev | .opencode/workflow/history/US-022.md |
| US-023 | ✅ Done | feat/US-023-lint-export | PR #24 → dev | .opencode/workflow/history/US-023.md |
| US-024 | ✅ Done | feat/US-024-middleware-landing | PR #25 → dev | .opencode/workflow/history/US-024.md |
| US-025 | ✅ Done | feat/US-025-csp-unsafe-inline | PR #26 → dev | .opencode/workflow/history/US-025.md |
| US-026 | ✅ Done | feat/US-026-login-session-fix | PR #27 → dev | .opencode/workflow/history/US-026.md |
| US-027 | ✅ Done | feat/US-027-ui-unificacion | PR #29 → dev, PR #30 → main | .opencode/workflow/history/US-027.md |
| US-028 | ✅ Done | feat/US-027-ui-unificacion | PR #29 → dev, PR #30 → main | .opencode/workflow/history/US-028.md |
| US-029 | ✅ Done | feat/US-029-v2 | Merge directo → dev, Merge directo → main | .opencode/workflow/history/US-029.md |
| US-030 | ✅ Done | feat/US-030-form-validations | Merge directo → dev, Merge directo → main | .opencode/workflow/history/US-030.md |
| US-031 | ✅ Done | feat/US-031-login-secure-cookie + fix/US-031-salt-router | PR #31 → dev, PR #33 → dev, PR #32 → main, PR #34 → main | .opencode/workflow/history/US-031.md |

## Backlog
| US | Status | Detail |
|----|--------|--------|
| US-032 | 📋 Backlog | Upload de Documentos PDF con Cloudflare R2 — .opencode/workflow/history/US-032.md |

## Project Status
✅ 30 US completadas (US-001 a US-031). Todas completadas.
📋 1 US en Backlog (US-032).
🛠️ Seed demo "Centro Hogar" completado — `npm run db:seed`
✅ Lint: 0 errores, 0 warnings.
✅ Typecheck: disponible y pasa sin errores.

## Último Cambio
**Portal del Cliente + Landing Page Marketing** — Branch `feat/admin-design-redesign`
- **Landing page**: Hero rediseñado, sección contacto con formulario + Leaflet Map + email Nodemailer
- **Portal del Cliente**: Login JWT (`/seguimiento`), dashboard con tabs (Resumen, Timeline, Hitos, Documentos, Auditoría, Pentesting)
- **APIs Portal**: `/api/portal/acceso` (login), `/api/portal/proyecto` (datos), `/api/portal/clave` (cambio contraseña), `/api/portal/documento/[id]` (descarga)
- **Email automático**: Al activar portal (credenciales) + al transicionar estado (si portal activo)
- **Admin Portal Section**: Toggle activo + cambio de contraseña en detalle de proyecto
- **Schema**: `portalClave` (bcrypt), `portalActivo` (boolean) en Proyecto + modelo `SesionPortal`
- **Middleware**: `/seguimiento/*` y `/api/portal/*` rutas públicas
- **PR #57**: https://github.com/FT-Key/LoBeMo_SI/pull/57

## Plan: US-033 — Campo `codigo` para Proyecto (Portal-Friendly ID)

### Objetivo
Agregar un campo `codigo` único y legible al modelo `Proyecto` (formato `LBM-XXXX-YYYY`) para reemplazar los CUIDs expuestos a clientes en URLs, emails y formularios del portal. El `id` (CUID) se mantiene como PK/FK interno.

### Archivos a crear
- `src/lib/proyecto-codigo.ts` — Función `generarCodigoProyecto(nombre: string): Promise<string>`
- `prisma/migrations/YYYYMMDDHHMMSS_add_proyecto_codigo/migration.sql` — Generado por `prisma migrate dev`

### Archivos a modificar
| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `prisma/schema.prisma` | Agregar `codigo String @unique` a Proyecto |
| 2 | `src/shared/validation/proyectos.ts` | Actualizar `portalAccesoSchema`: campo `codigo` en vez de `proyectoId` |
| 3 | `src/app/api/proyectos/route.ts` | Generar `codigo` en POST, incluir en response, usar en email |
| 4 | `src/app/api/proyectos/[id]/route.ts` | Incluir `codigo` en GET response, usar en email de activación portal |
| 5 | `src/app/api/portal/acceso/route.ts` | Lookup por `codigo` en vez de `id` |
| 6 | `src/app/api/portal/proyecto/route.ts` | JWT firma con `codigo` + `id`, retorno incluye `codigo` |
| 7 | `src/app/api/portal/documento/[id]/route.ts` | JWT decode usa `id` interno (sin cambio funcional) |
| 8 | `src/app/api/portal/clave/route.ts` | JWT decode usa `id` interno (sin cambio funcional) |
| 9 | `src/app/seguimiento/page.tsx` | Input acepta `codigo` (placeholder `LBM-XXXX-YYYY`) |
| 10 | `src/app/seguimiento/[id]/page.tsx` | Renombrar a `[codigo]/page.tsx`, lookup por `codigo` |
| 11 | `src/app/seguimiento/[id]/portal-content.tsx` | Renombrar a `[codigo]/portal-content.tsx`, agregar `codigo` al type |
| 12 | `src/components/modals/portal-login-modal.tsx` | Input acepta `codigo` |
| 13 | `prisma/seed.ts` | Generar `codigo` para el proyecto demo |

### Componentes
No se crean componentes nuevos. Se modifican componentes existentes.

### API Routes

#### POST `/api/portal/acceso` (modificada)
```typescript
// ANTES
{ proyectoId: string, clave: string }

// DESPUÉS
{ codigo: string, clave: string }
```
- Lookup: `prisma.proyecto.findUnique({ where: { codigo } })`
- JWT payload: `{ proyectoId: proyecto.id, codigo: proyecto.codigo, tipo: "portal" }`
- Response: `{ ok: true, codigo, nombre, cliente }`

#### GET `/api/portal/proyecto` (modificada)
- JWT decode extrae `proyectoId` (interno) para lookup
- Response incluye `codigo` en el select

#### GET `/api/portal/documento/[id]` (sin cambio funcional)
- JWT decode extrae `proyectoId` para authorization check
- El `[id]` del route sigue siendo el ID del documento, no del proyecto

### Tipos e interfaces
```typescript
// src/lib/proyecto-codigo.ts
export async function generarCodigoProyecto(nombre: string): Promise<string>
export async function existeCodigo(codigo: string): Promise<boolean>

// Type actualizado en portal-content.tsx y page.tsx
type ProyectoData = {
  id: string
  codigo: string  // ← NUEVO
  nombre: string
  // ... resto igual
}
```

### Dependencias
No se agregan dependencias nuevas. Se usa `crypto` (built-in) para generación aleatoria.

### Algoritmo de generación de código
```
1. Slugificar nombre: "Centro Hogar - Seguridad" → "centro-hogar-seguridad"
2. Tomar primeros 4 chars del slug: "cent"
3. Generar 4 chars alfanuméricos aleatorios: "A3K9"
4. Combinar: "LBM-CENT-A3K9"
5. Verificar uniqueness en DB; si existe, regenerar los 4 chars aleatorios
6. Máximo 10 intentos; si falla, lanzar error
```

### Consideraciones

#### Backward Compatibility (CRÍTICO)
- **URLs viejas `/seguimiento/{id}`**: Crear redirect o aceptar ambos formatos
  - Opción A (recomendada): El page `[codigo]/page.tsx` acepta tanto `codigo` como `id`
  - Si el param empieza con `cl` (CUID pattern), buscar por `id`; si no, buscar por `codigo`
  - Esto mantiene compatibilidad con emails viejos y bookmarks
- **JWT viejos**: El JWT existente solo tiene `proyectoId`. El middleware debe manejar ambos formatos
- **API `/api/portal/acceso`**: Aceptar `codigo` OR `proyectoId` en el body (transición gradual)

#### Seguridad
- `codigo` no es secreto — es un identificador público, no una contraseña
- La autenticación sigue siendo por `portalClave` (bcrypt)
- JWT firma incluye `id` interno para queries seguras
- Rate limiting en `/api/portal/acceso` (ya debería existir)

#### Performance
- Índice único en `codigo` ya cubierto por `@unique`
- Lookup por `codigo` es O(1) con índice
- No hay cambio en número de queries

### Orden de implementación

#### Fase 1: Schema + Migration + Utility
1. Modificar `prisma/schema.prisma` — agregar `codigo String @unique`
2. Ejecutar `npx prisma migrate dev --name add_proyecto_codigo`
3. Crear `src/lib/proyecto-codigo.ts` con la función de generación
4. Crear test unitario básico para la función

#### Fase 2: API Routes — Backend
5. Modificar `src/shared/validation/proyectos.ts` — actualizar schemas
6. Modificar `src/app/api/proyectos/route.ts` — generar código en POST
7. Modificar `src/app/api/proyectos/[id]/route.ts` — incluir código en response
8. Modificar `src/app/api/portal/acceso/route.ts` — lookup por código
9. Modificar `src/app/api/portal/proyecto/route.ts` — JWT con código
10. Verificar `src/app/api/portal/documento/[id]/route.ts` y `clave/route.ts`

#### Fase 3: Frontend — Portal
11. Modificar `src/app/seguimiento/page.tsx` — input de código
12. Renombrar `src/app/seguimiento/[id]/` → `src/app/seguimiento/[codigo]/`
13. Modificar `page.tsx` — dual lookup (codigo o id para compat)
14. Modificar `portal-content.tsx` — agregar `codigo` al type
15. Modificar `src/components/modals/portal-login-modal.tsx`

#### Fase 4: Seed + Email Templates
16. Modificar `prisma/seed.ts` — generar código para proyecto demo
17. Verificar emails en `proyectos/route.ts` y `proyectos/[id]/route.ts`

#### Fase 5: Quality Gates
18. Build: `npm run build`
19. Lint: `npm run lint`
20. Typecheck: `npx tsc --noEmit`
21. Test manual: crear proyecto, verificar código generado, login portal

### Testing Strategy

#### Unit Tests
- `generarCodigoProyecto()` genera formato correcto `LBM-XXXX-YYYY`
- Caracteres alfanuméricos válidos (A-Z, 0-9)
- Uniqueness check funciona
- Maneja nombres cortos / caracteres especiales

#### Integration Tests
- POST `/api/proyectos` genera código automáticamente
- POST `/api/portal/acceso` acepta `codigo` y retorna JWT
- GET `/api/portal/proyecto` retorna `codigo` en response
- URLs viejas con `id` siguen funcionando (backward compat)

#### Manual Testing
1. Crear proyecto nuevo → verificar código en DB
2. Login portal con código → acceder exitosamente
3. Copiar URL con código → navegar directamente
4. Email enviado muestra código en vez de ID
5. Admin panel muestra código en lista de proyectos


