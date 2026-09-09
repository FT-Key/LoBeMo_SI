# Auditoría Navbar y Navegación — US-063

**Fecha:** 2026-09-08
**Auditor:** @fr4nc0t2
**Estado:** ✅ Completa

---

## Resumen

Auditoría completa de la navegación del sistema LoBeMo SI para verificar que todas las funcionalidades sean accesibles desde el menú/sidebar y que los roles tengan los permisos correctos.

---

## 1. Sidebar Principal — Checklist de Enlaces

### Sección: Principal

| # | Enlace | Ruta | Roles Permitidos | Funciona | Notas |
|---|--------|------|------------------|----------|-------|
| 1 | Dashboard | `/dashboard` | GERENTE_GENERAL, CISO, ADMINISTRACION | ✅ | Dashboard ejecutivo con métricas |
| 2 | Mi Dashboard | `/mi-dashboard` | Todos | ✅ | Dashboard personal del empleado |

### Sección: Gestión

| # | Enlace | Ruta | Roles Permitidos | Funciona | Notas |
|---|--------|------|------------------|----------|-------|
| 3 | Proyectos | `/proyectos` | Todos | ✅ | Lista paginada, detalle, métricas, gantt por proyecto |
| 4 | Clientes | `/clientes` | Todos | ✅ | Lista paginada, creación, edición |
| 5 | Empleados | `/empleados` | GERENTE_GENERAL | ✅ | CRUD completo de empleados |
| 6 | Servicios | `/servicios` | Todos | ✅ | Lista y edición (solo GG edita) |

### Sección: Operaciones

| # | Enlace | Ruta | Roles Permitidos | Funciona | Notas |
|---|--------|------|------------------|----------|-------|
| 7 | Capacitaciones | `/capacitaciones` | CAPACITADOR, GERENTE_GENERAL, CISO | ✅ | Lista, creación, detalle |
| 8 | Pentesting | `/pentesting` | PENTESTER, CISO, GERENTE_GENERAL, ANALISTA_SEGURIDAD | ✅ | Lista, creación, detalle con hallazgos |
| 9 | Soporte | `/soporte` | SOPORTE_TECNICO, GERENTE_GENERAL, CISO | ✅ | Tickets de soporte |
| 10 | Auditoría | `/informes-auditoria` | AUDITOR, GERENTE_GENERAL, CISO | ✅ | Informes de auditoría |

### Sección: Herramientas

| # | Enlace | Ruta | Roles Permitidos | Funciona | Notas |
|---|--------|------|------------------|----------|-------|
| 11 | Tablero | `/kanban` | Todos | ✅ | Vista Kanban global de tareas |
| 12 | Cronograma | `/gantt` | Todos | ✅ | Vista Gantt global |
| 13 | Calendario | `/calendario` | Todos | ✅ | Calendario de hitos y vencimientos |

### Sección: Sistema

| # | Enlace | Ruta | Roles Permitidos | Funciona | Notas |
|---|--------|------|------------------|----------|-------|
| 14 | Manual | `/admin/manual` | GERENTE_GENERAL | ✅ | Manual de uso del sistema |
| 15 | Configuración | `/admin` | GERENTE_GENERAL | ✅ | Panel de configuración |

---

## 2. Subrutas Accesibles Desde Cada Módulo

### Proyectos (`/proyectos`)
- `/proyectos` — Lista de proyectos
- `/proyectos/nuevo` — Formulario de creación (solo GERENTE_GENERAL, CISO)
- `/proyectos/[id]` — Detalle con tabs: Resumen, Tareas, Kanban, Gantt, Asignaciones, Documentos, Hitos
- `/proyectos/[id]/metricas` — Métricas del proyecto (solo CISO, GERENTE_GENERAL)
- `/proyectos/[id]/gantt` — Gantt del proyecto

### Clientes (`/clientes`)
- `/clientes` — Lista de clientes
- `/clientes/nuevo` — Formulario de creación (GERENTE_GENERAL, ADMINISTRACION, VENTAS)
- `/clientes/[id]` — Detalle del cliente
- `/clientes/[id]/editar` — Formulario de edición

### Empleados (`/empleados`)
- `/empleados` — Lista de empleados
- `/empleados/nuevo` — Formulario de creación
- `/empleados/[id]/editar` — Formulario de edición

### Servicios (`/servicios`)
- `/servicios` — Lista de servicios (edición solo GERENTE_GENERAL)

### Capacitaciones (`/capacitaciones`)
- `/capacitaciones` — Lista de capacitaciones
- `/capacitaciones/nuevo` — Formulario de creación (CAPACITADOR, GERENTE_GENERAL)
- `/capacitaciones/[id]` — Detalle de capacitación

### Pentesting (`/pentesting`)
- `/pentesting` — Lista de hallazgos
- `/pentesting/nuevo` — Formulario de creación (PENTESTER, CISO, GERENTE_GENERAL)
- `/pentesting/[id]` — Detalle de hallazgo

### Soporte (`/soporte`)
- `/soporte` — Lista de tickets
- `/soporte/nuevo` — Formulario de creación
- `/soporte/[id]` — Detalle de ticket

### Informes de Auditoría (`/informes-auditoria`)
- `/informes-auditoria` — Lista de informes
- `/informes-auditoria/nuevo` — Formulario de creación (AUDITOR, GERENTE_GENERAL, CISO)
- `/informes-auditoria/[id]` — Detalle de informe

### Propuestas (accesible desde Proyectos, NO en sidebar)
- `/propuestas` — Lista de propuestas
- `/propuestas/nuevo` — Formulario de creación
- `/propuestas/[id]` — Detalle de propuesta

### Kanban (`/kanban`)
- `/kanban` — Tablero Kanban global

### Gantt (`/gantt`)
- `/gantt` — Cronograma Gantt global

### Calendario (`/calendario`)
- `/calendario` — Vista de calendario

### Admin (`/admin`)
- `/admin` — Panel de configuración
- `/admin/manual` — Manual de usuario

---

## 3. Rutas Públicas (sin autenticación)

| Ruta | Propósito | Funciona |
|------|-----------|----------|
| `/` | Landing page | ✅ |
| `/login` | Login de empleados | ✅ |
| `/seguimiento` | Portal de clientes (login) | ✅ |
| `/seguimiento/[codigo]` | Portal de seguimiento de proyecto | ✅ |
| `/solicitar-acceso` | Recuperación de acceso | ✅ |

---

## 4. Rutas Ocultas (sin link en sidebar)

| Ruta | Propósito | Roles | Issue |
|------|-----------|-------|-------|
| `/auditoria` | AuditLog del sistema | GERENTE_GENERAL | ⚠️ Sin link en sidebar — accesible solo por URL directa |

**Recomendación:** Agregar `/auditoria` al sidebar en la sección "Sistema" para el rol GERENTE_GENERAL, o documentar que es intencionalmente oculta.

---

## 5. Matriz de Visibilidad por Rol

| Rol | Dashboard | Mi Dashboard | Proyectos | Clientes | Empleados | Servicios | Capacitaciones | Pentesting | Soporte | Auditoría Inf. | Kanban | Gantt | Calendario | Manual | Config | Propuestas |
|-----|:---------:|:------------:|:---------:|:--------:|:---------:|:---------:|:--------------:|:----------:|:-------:|:--------------:|:------:|:-----:|:----------:|:------:|:------:|:----------:|
| GERENTE_GENERAL | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| CISO | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | ✅ |
| ADMINISTRACION | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | — | — | — | ✅ | ✅ | ✅ | — | — | ✅ |
| VENTAS | — | ✅ | ✅ | ✅ | — | ✅ | — | — | — | — | ✅ | ✅ | ✅ | — | — | ✅ |
| ANALISTA_SEGURIDAD | — | ✅ | ✅ | ✅ | — | ✅ | — | ✅ | — | — | ✅ | ✅ | ✅ | — | — | — |
| DESARROLLADOR | — | ✅ | ✅ | ✅ | — | ✅ | — | — | — | — | ✅ | ✅ | ✅ | — | — | — |
| ESPECIALISTA_REDES | — | ✅ | ✅ | ✅ | — | ✅ | — | — | — | — | ✅ | ✅ | ✅ | — | — | — |
| PENTESTER | — | ✅ | ✅ | ✅ | — | ✅ | — | ✅ | — | — | ✅ | ✅ | ✅ | — | — | — |
| SOPORTE_TECNICO | — | ✅ | ✅ | ✅ | — | ✅ | — | — | ✅ | — | ✅ | ✅ | ✅ | — | — | — |
| AUDITOR | — | ✅ | ✅ | ✅ | — | ✅ | — | — | — | ✅ | ✅ | ✅ | ✅ | — | — | — |
| CAPACITADOR | — | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | — | — | ✅ | ✅ | ✅ | — | — | — |

---

## 6. Issues Encontrados

### Issue 1: Ruta `/auditoria` sin link en sidebar
- **Severidad:** Baja
- **Descripción:** La ruta `/auditoria` (AuditLog del sistema) existe y tiene protección server-side (`requireGerenteGeneral()`), pero no está incluida en `NAV_ITEMS` del sidebar.
- **Impacto:** Solo accesible escribiendo la URL directamente en el navegador.
- **Recomendación:** Agregar el enlace al sidebar o documentar que es una ruta oculta intencional.

### Issue 2: Propuestas no tiene link directo en sidebar
- **Severidad:** Baja
- **Descripción:** El módulo de propuestas (`/propuestas`) no tiene enlace en el sidebar. Se accede desde la página de detalle de un proyecto.
- **Impacto:** Los usuarios deben navegar a un proyecto primero para acceder a propuestas.
- **Recomendación:** Considerar agregar "Propuestas" al sidebar en la sección "Gestión" o "Operaciones".

### Issue 3: Auditar consistencia de RBAC sidebar vs server
- **Severidad:** OK
- **Descripción:** El RBAC funciona en dos capas: filtrado client-side en el sidebar y protección server-side en cada página. Esto es correcto por seguridad.
- **Estado:** ✅ Correcto — el sidebar filtra visualmente, pero el server siempre valida.

---

## 7. Verificación de Funcionalidades por US

| US | Funcionalidad | Accesible desde Sidebar | Estado |
|----|---------------|------------------------|--------|
| US-001 | Login/Empleados | `/login` (público) + `/empleados` (sidebar) | ✅ |
| US-002 | Clientes | `/clientes` | ✅ |
| US-003 | Servicios | `/servicios` | ✅ |
| US-004 | Proyectos | `/proyectos` | ✅ |
| US-005 | Propuestas | Desde detalle de proyecto (no en sidebar) | ⚠️ |
| US-006 | Asignaciones | Desde detalle de proyecto | ✅ |
| US-007 | Tareas | Desde detalle de proyecto + Kanban | ✅ |
| US-008 | Hitos | Desde detalle de proyecto + Calendario | ✅ |
| US-009 | Dashboard ejecutivo | `/dashboard` | ✅ |
| US-010 | Documentos | Desde detalle de proyecto | ✅ |
| US-011 | Notificaciones | Dropdown en header | ✅ |
| US-012 | Informes auditoría | `/informes-auditoria` | ✅ |
| US-013 | Capacitaciones | `/capacitaciones` | ✅ |
| US-014 | Pentesting | `/pentesting` | ✅ |
| US-015 | AuditLog | `/auditoria` (sin sidebar) | ⚠️ |
| US-016 | Soporte | `/soporte` | ✅ |
| US-017 | Métricas | Desde detalle de proyecto `/proyectos/[id]/metricas` | ✅ |
| US-018 | Export PDF | Desde módulos individuales | ✅ |
| US-019 | Calendario | `/calendario` | ✅ |
| US-020 | Admin panel | `/admin` | ✅ |
| US-021 | Landing page | `/` (público) | ✅ |
| US-027-031 | UI/Forms/Login fixes | Mejoras transversales | ✅ |
| US-032 | Upload R2 | Desde detalle de proyecto/tarea | ✅ |
| US-033 | RBAC | Implementado en sidebar + server | ✅ |
| US-034-036 | Email templates | Backend (no visible en UI) | ✅ |
| US-038 | Export dashboard | Desde `/dashboard` | ✅ |
| US-039 | Búsqueda global | Dropdown en header | ✅ |
| US-040 | Filtros guardados | En listados | ✅ |
| US-041 | Comentarios | Desde detalle de proyecto | ✅ |
| US-042 | Mi dashboard | `/mi-dashboard` | ✅ |
| US-043 | Kanban | `/kanban` | ✅ |
| US-044 | Timer horas | Desde detalle de proyecto | ✅ |
| US-045 | Gantt | `/gantt` | ✅ |
| US-046 | Evidencia pentesting | Desde `/pentesting/[id]` | ✅ |
| US-047 | Theme toggle | Header + sidebar | ✅ |
| US-048 | Transiciones página | Transiciones animadas | ✅ |
| US-049 | Actividad dashboard | Desde `/dashboard` | ✅ |
| US-050-052 | Tests/Logging/Cleanup | Backend/infra | ✅ |
| US-053-054 | Fixes seed/comentarios | Backend | ✅ |
| US-055 | Servicios modal | `/servicios` | ✅ |
| US-056 | Certificados PDF | Desde `/capacitaciones/[id]` | ✅ |
| US-057 | Navbar accesibilidad | Sidebar | ✅ |
| US-058 | Evidencia pentesting fix | Desde `/pentesting/[id]` | ✅ |
| US-059-060 | Tests automatizados | Backend | ✅ |
| US-061 | QA Manual | Documentación | ✅ |
| US-064 | Kanban/Gantt fixes | `/kanban`, `/gantt` | ✅ |

---

## 8. Conclusión

**Estado general:** ✅ BUENO

- **15 enlaces en sidebar** — Todos funcionan correctamente
- **RBAC de doble capa** — Sidebar filtra visualmente, server valida el acceso
- **2 issues menores** — Ruta `/auditoria` sin sidebar, Propuestas sin link directo
- **0 rutas rotas** — Todas las rutas del sidebar llevan a páginas existentes
- **0 errores de navegación** — No se encontraron 404s ni errores de acceso

**Recomendaciones:**
1. Agregar `/auditoria` al sidebar (sección Sistema) para GERENTE_GENERAL
2. Considerar agregar "Propuestas" al sidebar para roles con acceso
