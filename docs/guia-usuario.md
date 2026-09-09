# Guía de Usuario — LoBeMo Seguridad Informática

Guía completa del sistema de gestión de proyectos de ciberseguridad.

---

## Contenido

1. [Acceso al Sistema](#1-acceso-al-sistema)
2. [Dashboard Ejecutivo](#2-dashboard-ejecutivo)
3. [Mi Dashboard](#3-mi-dashboard)
4. [Gestión de Empleados](#4-gestión-de-empleados)
5. [Gestión de Clientes](#5-gestión-de-clientes)
6. [Servicios](#6-servicios)
7. [Proyectos](#7-proyectos)
8. [Propuestas](#8-propuestas)
9. [Tareas y Kanban](#9-tareas-y-kanban)
10. [Hitos y Calendario](#10-hitos-y-calendario)
11. [Diagrama de Gantt](#11-diagrama-de-gantt)
12. [Documentos](#12-documentos)
13. [Notificaciones](#13-notificaciones)
14. [Comentarios](#14-comentarios)
15. [Búsqueda Global](#15-búsqueda-global)
16. [Métricas por Proyecto](#16-métricas-por-proyecto)
17. [Registro de Horas](#17-registro-de-horas)
18. [Capacitaciones](#18-capacitaciones)
19. [Pentesting](#19-pentesting)
20. [Informes de Auditoría](#20-informes-de-auditoría)
21. [Soporte Técnico](#21-soporte-técnico)
22. [AuditLog](#22-auditlog)
23. [Exportación](#23-exportación)
24. [Seguimiento de Proyectos](#24-seguimiento-de-proyectos)
25. [Portal del Cliente](#25-portal-del-cliente)
26. [Configuración y Administración](#26-configuración-y-administración)

---

## 1. Acceso al Sistema

### Login

1. Navegar a la URL del sistema
2. Ingresar **email** y **contraseña**
3. Hacer clic en **Iniciar sesión**
4. Serás redirigido al **Dashboard** según tu rol

### Primer Inicio de Sesión

Si no hay empleados registrados, el sistema muestra un enlace a **"Primer inicio"** donde el Gerente General se registra como superadmin.

### Solicitar Acceso

Si eres un nuevo empleado y no tienes credenciales, visita `/solicitar-acceso` para solicitar acceso al administrador.

---

## 2. Dashboard Ejecutivo

**Ruta:** `/dashboard`
**Visibles para:** Gerente General, CISO, Administración

Panel principal con indicadores clave del negocio:

| Indicador | Descripción |
|-----------|-------------|
| **Proyectos activos** | Cantidad de proyectos por estado (Relevamiento, Propuesta, Aprobado, En Ejecución, En Revisión) |
| **Empleados ocupados** | Empleados asignados a proyectos vs disponibles |
| **Ingresos del mes** | Monto total de propuestas aceptadas en el mes |
| **Clientes nuevos** | Clientes registrados en el período |

- Se actualiza en tiempo real (TanStack Query)
- Permite filtrar por rango de fechas

---

## 3. Mi Dashboard

**Ruta:** `/mi-dashboard`
**Visibles para:** Todos los empleados autenticados

Vista personal con:

- **Mis proyectos activos** — Proyectos donde estás asignado
- **Mis tareas pendientes** — Tareas asignadas con prioridad y fecha límite
- **Actividad reciente** — Últimas acciones en tus proyectos
- **Horas registradas** — Resumen de horas invertidas

---

## 4. Gestión de Empleados

**Ruta:** `/empleados`
**Visibles para:** Gerente General

### Roles Disponibles

| Rol | Área |
|-----|------|
| Gerente General | Gerencia |
| Administración y Contabilidad | Administración |
| Ventas y Atención al Cliente | Comercial |
| Jefe de Seguridad Informática (CISO) | Sistemas |
| Analista de Seguridad | Sistemas |
| Desarrollador de Software Seguro | Sistemas |
| Especialista en Redes | Sistemas |
| Tester de Seguridad (Pentester) | Sistemas |
| Soporte Técnico | Sistemas |
| Auditor de Seguridad | Auditoría |
| Capacitador en Ciberseguridad | Capacitación |

### Crear un Empleado

1. Ir a **Empleados** → **Nuevo Empleado**
2. Completar: nombre, apellido, email (único), contraseña
3. Seleccionar **rol** y **área**
4. Hacer clic en **Guardar**

### Editar / Desactivar

- Hacer clic en un empleado → **Editar** para modificar datos
- **Desactivar** para dar de baja lógica (el empleado no puede iniciar sesión pero se preserva su historial)

---

## 5. Gestión de Clientes

**Ruta:** `/clientes`
**Visibles para:** Administración, Ventas, Gerente General

### Crear un Cliente

1. Ir a **Clientes** → **Nuevo Cliente**
2. Completar campos:
   - **Razón Social** (obligatorio)
   - **CUIT** (único entre clientes activos)
   - Email de contacto
   - Teléfono
   - Dirección
   - Sector (Salud, Contable/Jurídico, Comercial, Logística, Agroindustria, Gobierno, Otro)
3. Hacer clic en **Guardar**

### Editar un Cliente

1. Ir a la lista → hacer clic en el cliente
2. Modificar campos necesarios
3. **Nota:** El CUIT requiere confirmación adicional para modificarse

### Desactivar un Cliente

- Solo se puede desactivar si **no tiene proyectos activos**
- Se realiza borrado lógico (el registro se preserva)

### Seguimiento Público

Los clientes pueden ver el estado de sus proyectos sin login en `/seguimiento` usando un código de proyecto.

---

## 6. Servicios

**Ruta:** `/servicios`
**Visibles para:** Gerente General

Los 6 servicios predefinidos de LoBeMo:

| Servicio | Descripción |
|----------|-------------|
| Auditoría ISO 27001 | Evaluación de cumplimiento normativo |
| Pentesting | Pruebas de penetración |
| Desarrollo Seguro | Software con estándares de seguridad |
| Consultoría en Redes | Infraestructura de red segura |
| Capacitación | Formación en ciberseguridad |
| Soporte Técnico | Asistencia y resolución de incidentes |

- Se puede editar la **descripción** y **precio base** de cada servicio
- No se pueden eliminar servicios con proyectos asociados

---

## 7. Proyectos

**Ruta:** `/proyectos`
**Visibles para:** Todos los empleados (según permisos)

### Flujo de Estados

```
RELEVAMIENTO → PROPUESTA → APROBADO → EN_EJECUCION ↔ EN_REVISION → ENTREGADO → CERRADO
```

### Crear un Proyecto

1. Ir a **Proyectos** → **Nuevo Proyecto**
2. Seleccionar **cliente** y **servicio**
3. Completar nombre, descripción, fechas
4. Solo Gerente General o CISO pueden crear proyectos

### Cambiar Estado

1. Abrir el proyecto
2. Hacer clic en el botón de transición de estado disponible
3. El sistema valida las reglas de negocio automáticamente:
   - No se puede pasar a PROPUESTA sin al menos una propuesta asociada
   - No se puede pasar a APROBADO sin propuesta ACEPTADA
   - No se puede marcar ENTREGADO si hay tareas pendientes
   - CERRADO es un estado terminal (sin retorno)

### Reglas de Negocio Clave

| Regla | Descripción |
|-------|-------------|
| RN-01 | Solo Gerente General o CISO pueden crear proyectos |
| RN-02 | PROPUESTA requiere al menos una propuesta asociada |
| RN-03 | APROBADO requiere propuesta ACEPTADA + monto acordado |
| RN-04 | EN_EJECUCION requiere al menos un empleado técnico asignado |
| RN-06 | ENTREGADO requiere todas las tareas COMPLETADAS |
| RN-07 | CERRADO es terminal (sin retorno) |
| RN-08 | Máximo 3 proyectos activos por empleado |

---

## 8. Propuestas

**Ruta:** `/propuestas`
**Visibles para:** Administración, Ventas, Gerente General

### Crear una Propuesta

1. Ir a **Propuestas** → **Nueva Propuesta**
2. Asociar a un proyecto en estado RELEVAMIENTO o PROPUESTA
3. Completar:
   - Monto total
   - Detalle de servicios (JSON flexible)
   - Fecha de emisión y vencimiento
4. Guardar como **ENVIADA**

### Estados de Propuesta

| Estado | Descripción |
|--------|-------------|
| ENVIADA | Propuesta enviada al cliente, pendiente de respuesta |
| ACEPTADA | Cliente aceptó la propuesta → el proyecto puede pasar a APROBADO |
| RECHAZADA | Cliente rechazó o la propuesta venció (automático) |
| RECOTIZADA | Nueva versión de una propuesta rechazada |

### Envío por Email

La propuesta puede enviarse por email directamente desde el sistema usando el botón **"Enviar por Email"**.

---

## 9. Tareas y Kanban

### Tareas (dentro de Proyectos)

**Ruta:** `/proyectos/[id]` → pestaña Tareas

| Campo | Valores |
|-------|---------|
| Estado | PENDIENTE, EN_PROGRESO, COMPLETADA, CANCELADA |
| Prioridad | BAJA, MEDIA, ALTA, CRITICA |
| Fecha límite | Opcional |

- Solo empleados asignados al proyecto pueden crear/modificar tareas
- CISO y Gerente General pueden ver/modificar todas las tareas
- Al completar una tarea **CRÍTICA**, se notifica al CISO automáticamente

### Tablero Kanban

**Ruta:** `/kanban`

Vista visual tipo tablero con columnas por estado:
- **Pendientes** → **En Progreso** → **Completadas**
- Permite arrastrar tareas entre columnas (drag & drop)
- Muestra prioridad y fecha límite de cada tarea

---

## 10. Hitos y Calendario

### Hitos (dentro de Proyectos)

**Ruta:** `/proyectos/[id]` → pestaña Hitos

- **Nombre**, **descripción**, **fecha prevista** y **fecha real** de cumplimiento
- El sistema notifica **3 días antes** de la fecha prevista
- Solo Gerente General y CISO pueden crear/modificar hitos

### Calendario

**Ruta:** `/calendario`

Vista integrada que muestra:
- **Hitos** de todos los proyectos
- **Vencimientos de propuestas**
- Navegación por mes/semana/día

---

## 11. Diagrama de Gantt

### Gantt Global

**Ruta:** `/gantt`

Diagrama de Gantt con todos los proyectos del sistema:
- Muestra línea de tiempo de cada proyecto
- Indica estado actual con color
- Permite hacer zoom y navegar

### Gantt por Proyecto

**Ruta:** `/proyectos/[id]/gantt`

Diagrama de Gantt detallado de un proyecto individual:
- Tareas con dependencias
- Hitos marcados
- Línea de tiempo actual

---

## 12. Documentos

**Ruta:** Dentro de cada proyecto/tarea

### Tipos de Documento

| Tipo | Descripción |
|------|-------------|
| INFORME_AUDITORIA | Informes de auditoría |
| REPORTE_PENTESTING | Reportes de pentesting |
| CODIGO_FUENTE | Código fuente |
| CONFIG_RED | Configuraciones de red |
| MATERIAL_CAPACITACION | Materiales de capacitación |
| CONTRATO | Contratos |
| OTRO | Otros documentos |

### Subir un Documento

1. Abrir el proyecto o tarea
2. Ir a la pestaña **Documentos**
3. Hacer clic en **Subir documento**
4. Seleccionar archivo (PDF, imágenes, Office, texto)
5. Seleccionar tipo de documento
6. Confirmar

### Almacenamiento

Los documentos se almacenan en **Cloudflare R2** (compatible S3) con CDN global.

---

## 13. Notificaciones

**Indicador:** Badge en el navbar (cantidad de no leídas)

| Tipo | Trigger |
|------|---------|
| ASIGNACION_PROYECTO | Se te asignó a un proyecto |
| CAMBIO_ESTADO | Un proyecto cambió de estado |
| VENCIMIENTO | Propuesta próxima a vencer (3 días) |
| MENSAJE | Mensaje general del sistema |

- Hacer clic en una notificación la marca como **leída** y te lleva al recurso relacionado
- El badge se actualiza en tiempo real

---

## 14. Comentarios

**Ruta:** Dentro de proyectos y tareas

Sistema de comentarios para discusiones en contexto:
- Agregar comentarios en proyectos o tareas
- Los comentarios se guardan con autor y fecha
- Útil para comunicar decisiones y actualizaciones de avance

---

## 15. Búsqueda Global

**Ruta:** `/search`

Búsqueda full-text entre:
- **Proyectos** (nombre, descripción, cliente)
- **Clientes** (razón social, CUIT)
- **Tareas** (título, descripción)
- **Empleados** (nombre, email)

Permite encontrar rápidamente cualquier recurso del sistema.

---

## 16. Métricas por Proyecto

**Ruta:** `/proyectos/[id]/metricas`

Gráficos y estadísticas de un proyecto:
- **Avance porcentaje** de tareas completadas
- **Horas invertidas** por empleado
- **Tareas completadas** vs pendientes
- **Distribución por prioridad**

---

## 17. Registro de Horas

**Ruta:** Dentro de cada proyecto

Los empleados pueden registrar horas invertidas:
1. Seleccionar proyecto
2. Indicar cantidad de horas
3. Agregar descripción de la actividad
4. Las horas se acumulan para métricas y reporting

---

## 18. Capacitaciones

**Ruta:** `/capacitaciones`
**Visibles para:** Capacitador, Gerente General

### Crear una Capacitación

1. Ir a **Capacitaciones** → **Nueva Capacitación**
2. Completar: nombre, temario, duración, modalidad (presencial/remota)
3. Asociar a un proyecto

### Gestionar Asistentes

1. Abrir la capacitación
2. Agregar asistentes
3. Registrar evaluación de desempeño

### Certificado Digital

Al completar satisfactoriamente la capacitación, el sistema genera un **certificado PDF** descargable.

---

## 19. Pentesting

**Ruta:** `/pentesting`
**Visibles para:** Pentester, CISO

### Registrar un Hallazgo

1. Ir a **Pentesting** → **Nuevo Hallazgo**
2. Completar:
   - **Título** y **descripción** de la vulnerabilidad
   - **Severidad:** CRITICA, ALTA, MEDIA, BAJA
   - **Evidencia** (capturas, logs)
   - **Recomendación** de remediación
3. Asociar a un proyecto de tipo PENTESTING

### Flujo de Aprobación

1. Pentester registra el hallazgo
2. CISO revisa y aprueba/rechaza
3. Los hallazgos aprobados se incluyen en el informe final

---

## 20. Informes de Auditoría

**Ruta:** `/informes-auditoria`
**Visibles para:** Auditor, Gerente General

### Crear un Informe

1. Ir a **Informes de Auditoría** → **Nuevo Informe**
2. Completar:
   - **Alcance** de la auditoría
   - **Criterios** de auditoría
   - **Hallazgos** y **no conformidades**
   - **Observaciones** y **recomendaciones**
3. Asociar a un proyecto de tipo AUDITORIA_ISO27001

### Exportar

El informe puede exportarse a **PDF** profesional.

---

## 21. Soporte Técnico

**Ruta:** `/soporte`
**Visibles para:** Soporte Técnico, CISO, Gerente General

### Crear un Ticket

1. Ir a **Soporte** → **Nuevo Ticket**
2. Completar: asunto, descripción, prioridad
3. Vincular a un proyecto (opcional)

### Gestión de Tickets

| Campo | Descripción |
|-------|-------------|
| Estado | Nuevo, En Progreso, Resuelto, Cerrado |
| Prioridad | Baja, Normal, Alta, Urgente |
| Registro de resolución | Documentar pasos tomados |

---

## 22. AuditLog

**Ruta:** `/auditoria`
**Visibles para:** Solo Gerente General

Registro inmutable de toda operación CRUD del sistema:

| Campo | Descripción |
|-------|-------------|
| Empleado | Quién realizó la acción |
| Acción | CREATE, UPDATE, DELETE |
| Entidad | Qué entidad fue modificada |
| Fecha y hora | Cuándo ocurrió |
| Detalle | Cambios realizados (JSON) |

Filtros disponibles: por entidad, empleado, rango de fechas, tipo de acción.

---

## 23. Exportación

El sistema permite exportar a **PDF** y **Excel**:

| Módulo | Formato |
|--------|---------|
| Informes de Auditoría | PDF |
| Hallazgos de Pentesting | PDF |
| Dashboard Ejecutivo | Excel |
| Estado de Proyecto | PDF |
| Certificados de Capacitación | PDF |

---

## 24. Seguimiento de Proyectos

**Ruta:** `/seguimiento`
**Visibles para:** Clientes (sin login)

Portal público para que los clientes puedan:

1. Ingresar el **código de proyecto**
2. Ver el **estado actual** del proyecto
3. Consultar **documentos públicos**
4. No requiere autenticación

---

## 25. Portal del Cliente

**Acceso:** Con clave proporcionada por LoBeMo

Portal autenticado para clientes con acceso privilegiado:

- Ver documentos del proyecto
- Descargar informes
- Consultar estado detallado
- Acceso mediante JWT (token de acceso)

---

## 26. Configuración y Administración

**Ruta:** `/admin`
**Visibles para:** Solo Gerente General

### Panel de Administración

- **Configuración del sistema** — Parámetros globales
- **Manual de uso** — Manuales internos en Markdown
- **Gestión de usuarios** — Crear, editar, desactivar empleados

### Manuales Internos

El sistema incluye manuales accesibles desde `/admin/manual`:

- **Manual de Uso** — Guía general del sistema
- **Roles y Permisos** — Matriz de permisos por rol
- **Reglas y Restricciones** — Reglas de negocio del sistema

---

## Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + K` | Búsqueda global |
| `Esc` | Cerrar modales |

---

## Soporte

Para problemas técnicos o consultas, contactar al equipo de Soporte Técnico de LoBeMo a través del sistema o por email.
