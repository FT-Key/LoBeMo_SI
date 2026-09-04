# Manual de Uso del Sistema

Guía completa para el uso diario de LoBeMo - Seguridad Informática.

---

## Acceso al Sistema

1. Navegar a la URL del sistema
2. Ingresar email y contraseña
3. Hacer clic en **Iniciar sesión**
4. Serás redirigido al **Dashboard** según tu rol

---

## Dashboard

El Dashboard muestra un resumen general del sistema:

- **Proyectos activos** por estado
- **Tareas pendientes** asignadas a ti
- **Propuestas próximas a vencer**
- **Notificaciones** sin leer

---

## Gestión de Clientes

### Crear un Cliente

1. Ir a **Clientes** en el navbar
2. Hacer clic en **Nuevo Cliente**
3. Completar los campos obligatorios:
   - Razón Social
   - CUIT (debe ser único)
   - Email de contacto
4. Hacer clic en **Guardar**

### Editar un Cliente

1. Ir a la lista de clientes
2. Hacer clic en el cliente a editar
3. Modificar los campos necesarios
4. Hacer clic en **Actualizar**

---

## Gestión de Proyectos

### Crear un Proyecto

1. Ir a **Proyectos** en el navbar
2. Hacer clic en **Nuevo Proyecto**
3. Completar:
   - Nombre del proyecto
   - Descripción
   - Seleccionar **Cliente** (obligatorio)
   - Seleccionar **Servicio** (obligatorio)
   - Fecha estimada de fin (opcional)
   - Monto acordado (opcional)
4. Hacer clic en **Crear**

> **Importante**: No se puede crear un proyecto sin seleccionar un cliente.

### Ciclo de Vida de un Proyecto

Un proyecto pasa por los siguientes estados:

1. **RELEVAMIENTO** → Estado inicial
2. **PROPUESTA** → Se crea una propuesta para el cliente
3. **APROBADO** → El cliente acepta la propuesta
4. **EN_EJECUCION** → El proyecto está en desarrollo
5. **EN_REVISION** → En revisión de calidad
6. **ENTREGADO** → Entregado al cliente
7. **CERRADO** → Proyecto finalizado

### Transiciones de Estado

- **RELEVAMIENTO → PROPUESTA**: Requiere al menos 1 propuesta creada
- **PROPUESTA → APROBADO**: Requiere una propuesta con estado "ACEPTADA" y montoAcordado definido
- **APROBADO → EN_EJECUCION**: Requiere al menos 1 asignación con rol técnico
- **EN_EJECUCION → EN_REVISION**: Siempre permitido
- **EN_REVISION → ENTREGADO**: Requiere que todas las tareas estén COMPLETADAS
- **ENTREGADO → CERRADO**: Siempre permitido (estado terminal)

---

## Gestión de Empleados

### Asignar Empleados a un Proyecto

1. Ir al detalle del proyecto
2. Hacer clic en **Asignar empleado**
3. Seleccionar el empleado y su rol en el proyecto
4. Confirmar la asignación

> **Regla**: Un empleado no puede tener más de 3 proyectos activos simultáneamente (configurable).

---

## Gestión de Tareas

### Crear una Tarea

1. Ir al detalle del proyecto
2. Hacer clic en **Nueva Tarea**
3. Completar:
   - Título
   - Descripción
   - Prioridad (BAJA, MEDIA, ALTA, CRITICA)
   - Fecha límite (opcional)
4. Asignar a una asignación del proyecto
5. Hacer clic en **Crear**

### Estados de una Tarea

- **PENDIENTE** → Recién creada
- **EN_PROGRESO** → En desarrollo
- **COMPLETADA** → Finalizada

---

## Gestión de Documentos

### Subir un Documento

1. Ir al detalle del proyecto
2. Hacer clic en **Subir Documento**
3. Seleccionar el archivo (PDF, imágenes, Office)
4. Seleccionar el tipo de documento
5. Hacer clic en **Subir**

> **Límite**: 25MB por archivo.

### Tipos de Documento Permitidos

- INFORME
- CONTRATO
- PROPUESTA
- CERTIFICADO
- MANUAL
- PLANTILLA
- OTRO

---

## Generación de Certificados

1. Ir a **Capacitaciones**
2. Seleccionar una capacitación
3. Ir a la pestaña de **Asistentes**
4. Marcar un asistente como **Completado**
5. Hacer clic en **Generar Certificado**

El sistema genera un certificado con código único y fecha de emisión.

---

## Calendario

El calendario muestra:

- **Inicio de proyectos**
- **Fechas límite de tareas**
- **Hitos próximos**
- **Vencimiento de propuestas**

---

## Notificaciones

- Las notificaciones aparecen en el ícono de campana en el navbar
- Se marcan como leídas al hacer clic
- Incluyen avisos de:
  - Asignación a proyectos
  - Cambios de estado
  - Tareas próximas a vencer
  - Propuestas por vencer
