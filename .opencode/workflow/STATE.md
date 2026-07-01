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
- **ID**: US-013
- **Card**: [vMgEsgSd](https://trello.com/c/vMgEsgSd)
- **Status**: Quality Gates
- **Phase**: P3
- **Detail**: `.opencode/workflow/history/US-013.md`

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
| US-011 | ✅ Done | feat/US-011-sistema-notificaciones | PR #14 → dev | .opencode/workflow/history/US-011.md |
| US-013 | 🔄 In Progress | — | — | .opencode/workflow/history/US-013.md |

## Lint Results
### US-013 — Gestión de Capacitaciones

#### Linter
- **Comando**: `npm run lint` → Falló (ESLint no encontrado)
- **Causa**: `node_modules/` no está instalado — `npm install` no se ha ejecutado
- **Auto-fix aplicado**: No (imposible sin node_modules)

#### Typecheck
- **Comando**: `npm run typecheck` → Falló (script no existe en package.json)
- **Causa**: No hay script "typecheck" configurado; `npx tsc --noEmit` no disponible por restricciones de seguridad
- **Errores detectables**: Ver análisis estático a continuación

---

### Detalle de errores por archivo (US-013)

#### Prisma Schema — `prisma/schema.prisma`
- ✅ **Sin errores detectables**
  - Modelos `Capacitacion`, `AsistenteCapacitacion`, `CertificadoCapacitacion` correctamente definidos
  - Relaciones con `onDelete` por defecto (Restrict) — consistentes con el resto del esquema
  - `@@map` y `@map` usados correctamente para todas las tablas y columnas
  - `@unique` en `CertificadoCapacitacion.asistenteId` correcto (1:1 con AsistenteCapacitacion)

#### API — `src/app/api/capacitaciones/route.ts`
- ⚠️ **Posible warning de ESLint**: `ESTADOS` (línea 5) declarada pero no usada en este archivo (solo se usa en `[id]/route.ts`). ESLint con regla `@typescript-eslint/no-unused-vars` podría marcarla.
- ⚠️ **Type safety débil**: `where: Record<string, unknown>` (línea 21) — se pierde type safety de Prisma. Al asignar `where.OR` (línea 23), TypeScript no valida que los campos contengan operadores válidos de Prisma como `contains` o `mode`. Usar `Prisma.CapacitacionWhereInput`.
- ⚠️ **Mismo patrón en POST**: `parseInt(duracionHoras)` (línea 109) sin validación previa de tipo — si `duracionHoras` llega como string no numérico, `parseInt` devuelve `NaN` y Prisma lanza error 500 en lugar de 400.

#### API — `src/app/api/capacitaciones/[id]/route.ts`
- ⚠️ **Type safety débil**: `data: Record<string, unknown>` (línea 75) — mismo problema que arriba. La actualización de Prisma recibe un objeto sin tipado, perdiendo validación en tiempo de compilación. Usar `Prisma.CapacitacionUpdateInput`.
- ⚠️ **Inconsistencia en materiales**: En POST (route.ts línea 113), `materiales` vacío se guarda como `null`. En PATCH (línea 87), si `materiales` es `""` (string vacío), se guarda como `""` en lugar de `null`. Recomendación: normalizar en PATCH: `data.materiales = materiales || null`.

#### API — `src/app/api/capacitaciones/[id]/asistentes/route.ts`
- ✅ **Sin errores detectables**
  - Validación correcta de campos obligatorios
  - Autorización correcta (CAPACITADOR o GERENTE_GENERAL)
  - Auditoría correcta con `auditLog.create`

#### API — `src/app/api/capacitaciones/[id]/asistentes/[asisId]/route.ts`
- ⚠️ **Validación de evaluación**: `parseInt(evaluacion)` (línea 39) — si `evaluacion` es un string vacío o no numérico, `parseInt` devuelve `NaN`, que pasa la validación `val < 1 || val > 10` como `true` (ya que `NaN` comparado con números siempre da `false`), causando que se guarde `NaN` en la BD. Se debe validar con `isNaN()` explícitamente.
- ✅ **Estructura correcta**: uso de `_request` con underscore para parámetros no usados, `params: Promise<...>` con `await`.

#### API — `src/app/api/capacitaciones/[id]/certificado/route.ts`
- ✅ **Sin errores detectables**
  - Validación de regla de negocio RN-CAP-03 correcta (no certificar si no completó)
  - Prevención de duplicados correcta (si ya tiene certificado, rechaza)
  - Generación de código de certificado con formato adecuado

#### Server Component — `src/app/capacitaciones/page.tsx`
- ✅ **Sin errores detectables**
  - SSR con `requireAuth()` correcto
  - Serialización con `JSON.parse(JSON.stringify(...))` — patrón común para Prisma
  - Filtro por rol correcto

#### Server Component — `src/app/capacitaciones/nuevo/page.tsx`
- ⚠️ **Posible filtro incorrecto de estados**: `estado: { in: ["APROBADO", "EN_EJECUCION", "EN_REVISION"] }` (línea 20) — estos valores pueden no coincidir con los estados reales de proyectos en la base de datos. El modelo `Proyecto` tiene `estado: String @default("RELEVAMIENTO")`, y no hay restricción de enum. Si los valores guardados difieren, el select de proyectos aparecerá vacío. Verificar consistencia con el resto del código.
- ✅ **Resto del componente correcto**: SSR, autorización, serialización.

#### Client Component — `src/components/capacitaciones/capacitacion-list.tsx`
- ✅ **Sin errores detectables**
  - Tipos `Capacitacion` y `Pagination` definidos correctamente
  - `"use client"` correcto para estado interactivo
  - Paginación y filtros funcionales
  - Acceso seguro a `MODALIDAD_BADGES[c.modalidad] ?? ""`
  - Acceso seguro a `ESTADO_LABELS[c.estado] ?? c.estado`

#### Client Component — `src/components/capacitaciones/capacitacion-form.tsx`
- ✅ **Sin errores detectables**
  - Validación completa en cliente antes de enviar
  - Hook `useRouter` de `next/navigation` correcto
  - Manejo de errores con try/catch
  - Tipos correctos para `Proyecto`

#### Server Component — `src/app/capacitaciones/[id]/page.tsx`
- ✅ **Sin errores detectables**
  - `params: Promise<{ id: string }>` y `await params` — patrón correcto para Next.js 16
  - Uso de `notFound()` para 404
  - Serialización y props correctas al componente cliente

#### Client Component — `src/components/capacitaciones/capacitacion-detalle.tsx`
- ⚠️ **Validación `asis.evaluacion` en UI**: línea 503-504 — cuando `e.target.value` es `""` (input vacío), `parseInt("")` devuelve `NaN`, pero `NaN` se envía a la API. Aunque la API lo rechaza con error 400, sería mejor validar en cliente antes de enviar.
- ✅ **Estructura y lógica correcta**: estados, transiciones, CRUD de asistentes, generación de certificados, manejo de errores.

---

### Resumen de issues encontrados (US-013)

| Archivo | Tipo | Gravedad | Descripción |
|---------|------|----------|-------------|
| `prisma/schema.prisma` | — | ✅ | Sin errores |
| `capacitaciones/route.ts` | Unused var | ⚠️ Baja | `ESTADOS` declarado pero no usado en el archivo |
| `capacitaciones/route.ts` | Type safety | ⚠️ Media | `where: Record<string, unknown>` pierde tipado Prisma |
| `capacitaciones/route.ts` | Validación | ⚠️ Media | `parseInt` sin validación previa (`duracionHoras`) |
| `[id]/route.ts` | Type safety | ⚠️ Media | `data: Record<string, unknown>` pierde tipado Prisma |
| `[id]/route.ts` | Inconsistencia | ⚠️ Baja | `materiales` vacío se guarda como `""` en PATCH vs `null` en POST |
| `[id]/asistentes/[asisId]/route.ts` | Validación | ⚠️ Media | `parseInt` sin `isNaN()` — puede guardar `NaN` en BD |
| `capacitaciones/nuevo/page.tsx` | Lógica | ⚠️ Media | Estados de proyecto pueden no coincidir con la BD |
| `capacitacion-detalle.tsx` | Validación | ⚠️ Baja | `parseInt("")` envía `NaN` a la API sin validación previa |

### Problemas bloqueantes para tools automatizadas
| Ítem | Estado |
|------|--------|
| `node_modules/` instalado | ❌ No — se requiere `npm install` |
| Script `typecheck` en package.json | ❌ No existe — usar `npx tsc --noEmit` |
| Prisma Client generado | ❌ No — se requiere `npx prisma generate` |
| Ejecución de ESLint | ❌ No ejecutable |
| Ejecución de TypeScript | ❌ No ejecutable |

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

## Completed US
| US | Detail |
|----|--------|
| US-011 | Sistema de notificaciones implementado. PR #14 → dev (squash merge). |
| US-012 | Informes de auditoría implementado. PR #15 → dev (merge). |

## Current Phase
### US-012 — Informes de auditoría (cumplimiento normativo)
- **Phase**: ✅ Done
- **Status**: Completado. Mergeado a dev via PR #15.

## Review Findings

### Bloqueantes

1. **Archivos almacenados como base64 en la base de datos (Rendimiento/Escalabilidad)**
   - **Archivo**: `src/app/api/documentos/route.ts` (POST) y `src/app/proyectos/[id]/proyecto-detalle.tsx` (handleSubirDocumento)
   - **Problema**: El contenido completo del archivo (hasta 10MB) se almacena como data URL base64 en el campo `url` de tipo `String` en PostgreSQL. Esto es insostenible: base64 añade ~33% de overhead, infla la base de datos, degrada el rendimiento de queries (incluso con paginación, la DB debe leer columnas enormes), y hace las copias de seguridad impracticables.
   - **Sugerencia**: Implementar un sistema de almacenamiento externo (S3, R2, o disco local con ruta relativa). Guardar solo la URL/ruta en la DB y servir archivos estáticos. Alternativa mínima: usar `Blob` de Vercel o Cloudinary.

2. **Falta de validación de tipo de archivo en el servidor (Seguridad)**
   - **Archivo**: `src/app/api/documentos/route.ts` (POST, línea 75-90)
   - **Problema**: La validación de tipo MIME y extensión solo ocurre en el cliente (`proyecto-detalle.tsx` líneas 509-526). El servidor no valida el contenido del archivo en absoluto. Un atacante puede subir ejecutables, scripts maliciosos o cualquier tipo de archivo directamente contra la API.
   - **Sugerencia**: Agregar validación server-side del MIME type real (inspeccionando magic bytes) y/o forzar un servidor de archivos intermedio que rechace tipos peligrosos.

3. **Riesgo de XSS mediante data URLs en previsualización (Seguridad)**
   - **Archivo**: `src/app/proyectos/[id]/proyecto-detalle.tsx` (líneas 1161-1174)
   - **Problema**: Las data URLs se usan directamente en `<img src={d.url}>`, `<iframe src={d.url}>` y `<a href={d.url}>`. Si un atacante manipula el contenido del archivo o la URL, podría inyectar `data:text/html;base64,...` con JavaScript, ejecutándose en el contexto de la aplicación.
   - **Sugerencia**: No usar data URLs para renderizado. Servir archivos desde un endpoint dedicado con Content-Disposition: attachment y Content-Type controlado. Para vistas previa, usar un sandbox en el iframe o servidores de vista previa dedicados.

4. **Roles AUDITOR y CAPACITADOR no pueden subir documentos desde la UI (UX/Accesibilidad)**
   - **Archivo**: `src/app/proyectos/[id]/proyecto-detalle.tsx` (línea 1096)
   - **Problema**: La API POST permite a AUDITOR y CAPACITADOR subir documentos (línea 101 de `documentos/route.ts`), pero el formulario de subida solo se muestra cuando `puedeGestionarTareas` es true, que se define como `esCisoOGerente || estaAsignado` (línea 144). AUDITOR y CAPACITADOR no pueden acceder a la funcionalidad desde la UI.
   - **Sugerencia**: Alinear la UI con la lógica del servidor. Agregar `sessionRol === "AUDITOR" || sessionRol === "CAPACITADOR"` a la condición que controla la visibilidad del formulario de subida.

### Recomendaciones

1. **Código duplicado: `puedeVerDocumentos` en dos archivos (DRY)**
   - La función `puedeVerDocumentos` está definida en `src/app/api/documentos/route.ts` (línea 15) y `src/app/api/documentos/[id]/route.ts` (línea 5) con la misma implementación. Extraer a un helper compartido como `src/lib/permissions.ts`.

2. **Input de archivo no se resetea tras subida exitosa (UX)**
   - En `handleSubirDocumento` (línea 545), `setDocArchivo(null)` no limpia el input de tipo file de HTML, que no está controlado por React. El usuario ve el nombre del archivo anterior. Usar una `key` prop en el `<input type="file">` basada en un contador para forzar el re-renderizado.

3. **Sin botón de descarga para imágenes y PDFs (UX)**
   - En la previsualización (líneas 1161-1163), las imágenes se muestran inline sin opción de descarga. Los PDFs se muestran en iframe sin botón de descarga. Solo el caso `else` ofrece un enlace de descarga. Agregar botón "Descargar" consistente para todos los tipos.

4. **Sin rate limiting en endpoint de subida (Seguridad/Robustez)**
   - El POST a `/api/documentos` no tiene rate limiting. Un atacante podría subir cientos de archivos grandes y saturar el almacenamiento. Implementar rate limiting (ej: 10 requests/minuto por usuario) siguiendo el patrón de `src/lib/rate-limit.ts` descrito en la skill de seguridad.

5. **Falta de validación del formato de `tareaId` (Robustez)**
   - Si se envía un `tareaId` con formato inválido (no cuid), Prisma lanza una excepción y la API responde con 500 en lugar de 400. Validar que `tareaId` tenga formato cuid antes de pasarlo a Prisma.

6. **Faltan referencias a requerimientos (RF) en mensajes de error**
   - Otros endpoints incluyen números de RF en mensajes de error (ej: `"(RF-30)"` en tareas). Los endpoints de documentos no incluyen referencias a RF-40 a RF-45. Agregar `"(RF-XX)"` para facilitar trazabilidad.

7. **`where` tipado como `Record<string, unknown>` (TypeScript)**
   - En `documentos/route.ts` línea 45, el objeto `where` usa `Record<string, unknown>`, perdiendo type safety de Prisma. Usar `Prisma.documentoFindManyArgs['where']` o similar para mantener tipado completo.
