# Reglas y Restricciones del Sistema

Normativas y validaciones de negocio implementadas en LoBeMo.

---

## Reglas de Proyectos

### RN-01: Cliente Obligatorio
No se puede crear un proyecto sin seleccionar un cliente existente y activo.

### RN-02: Servicio Obligatorio
No se puede crear un proyecto sin seleccionar un servicio.

### RN-03: Monto Acordado
El monto acordado debe ser mayor a 0 cuando se aprueba una propuesta.

### RN-04: Transiciones de Estado
Los cambios de estado siguen un flujo estricto (ver Manual de Uso - Ciclo de Vida). No se permite saltar estados.

### RN-05: Cierre de Proyecto
Un proyecto solo puede cerrarse cuando todas sus tareas estén en estado COMPLETADA.

### RN-06: Estado Terminal
Una vez cerrado un proyecto, no se puede cambiar su estado.

---

## Reglas de Propuestas

### RN-07: Propuesta Mínima
No se puede avanzar de RELEVAMIENTO a PROPUESTA sin al menos una propuesta creada.

### RN-08: Aprobación de Propuesta
Para avanzar de PROPUESTA a APROBADO, debe existir una propuesta con estado "ACEPTADA".

### RN-09: Vigencia de Propuesta
Las propuestas tienen una fecha de vencimiento. Una vez vencida, no puede aceptarse.

---

## Reglas de Asignaciones

### RN-10: Asignación Técnica
Para avanzar de APROBADO a EN_EJECUCION, debe existir al menos 1 asignación con rol técnico (DESARROLLADOR, ANALISTA_SEGURIDAD, PENTESTER, ESPECIALISTA_REDES, etc.).

### RN-11: Asignación Única
Un empleado no puede tener dos asignaciones en el mismo proyecto.

### RN-12: Límite de Proyectos Activos
Un empleado no puede tener más de **3 proyectos activos** simultáneamente (EN_EJECUCION o EN_REVISION). Este valor es configurable desde el panel de administración.

---

## Reglas de Tareas

### RN-13: Tareas para Entrega
No se puede avanzar de EN_REVISION a ENTREGADO si hay tareas en estado PENDIENTE o EN_PROGRESO.

### RN-14: Prioridad por Defecto
Toda tarea nueva se crea con prioridad MEDIA.

### RN-15: Fecha Límite
La fecha límite de una tarea no puede ser anterior a la fecha de inicio del proyecto.

---

## Reglas de Documentos

### RN-16: Tipos Permitidos
Solo se permiten archivos con los siguientes MIME types:
- `application/pdf`
- `image/png`, `image/jpeg`, `image/gif`, `image/webp`
- `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `text/plain`, `text/csv`

### RN-17: Tamaño Máximo
El tamaño máximo por archivo es de **25MB**.

### RN-18: Permisos de Subida
Solo pueden subir documentos:
- El **GERENTE_GENERAL**
- El **CISO**
- Empleados **asignados** al proyecto

---

## Reglas de Capacitaciones

### RN-19: Estado de Capacitación
- Solo se puede calificar asistentes en capacitaciones con estado "EN_CURSO" o "COMPLETADA"
- Un asistente no puede evaluarse a sí mismo

### RN-20: Certificado Único
Cada asistente solo puede tener un certificado por capacitación.

---

## Reglas de Auditoría

### RN-21: Log Obligatorio
Toda operación CREATE, UPDATE o DELETE genera un registro en la tabla `audit_logs`.

### RN-22: No Modificable
Los registros de auditoría no se pueden modificar ni eliminar.

---

## Reglas de Notificaciones

### RN-23: Notificación por Asignación
Al asignar un empleado a un proyecto, se genera automáticamente una notificación.

### RN-24: Notificación por Estado
Al cambiar el estado de un proyecto, se notifica a todos los empleados asignados.

---

## Reglas de autenticación

### RN-25: Sesión JWT
La sesión utiliza JWT con una duración configurable.

### RN-26: Password Hasheado
Las contraseñas se almacenan con bcrypt (12 rounds).

### RN-27: Roles y Permisos
Cada ruta está protegida por roles. Solo los roles autorizados pueden acceder (ver tabla de permisos en "Roles y Permisos").

---

## Configuración del Sistema

Las siguientes reglas son configurables desde **Panel de Administración**:

| Parámetro | Valor por defecto | Descripción |
|-----------|-------------------|-------------|
| `MAX_PROYECTOS_ACTIVOS_POR_EMPREADO` | 3 | Límite de proyectos simultáneos |
| `DIAS_AVISO_VENCIMIENTO_PROPUESTA` | 7 | Días antes del vencimiento para avisar |
| `DIAS_AVISO_HITO` | 3 | Días antes del hito para avisar |
