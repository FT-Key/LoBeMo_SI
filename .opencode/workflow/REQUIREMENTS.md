# Requirements: LoBeMo Seguridad Informática — Sistema de Gestión de Proyectos de Ciberseguridad

## Resumen Ejecutivo

LoBeMo Seguridad Informática es una empresa tucumana especializada en ciberseguridad, con 11 colaboradores organizados en 4 áreas (Gerencia, Administración, Comercial, Sistemas) más dos roles que reportan directamente a Gerencia (Auditoría y Capacitación). La empresa brinda servicios de auditoría de seguridad, pentesting, desarrollo de software seguro, monitoreo de redes, consultoría en ciberseguridad y capacitación.

Se desarrollará un sistema de gestión interno (web app) que permita a LoBeMo administrar sus proyectos de ciberseguridad, clientes, propuestas, recursos humanos y la trazabilidad completa del ciclo de vida de cada servicio. El sistema es single-tenant (solo para LoBeMo).

**Stack tecnológico:** Next.js 15 App Router, Prisma, PostgreSQL (Neon serverless), Auth.js v5, TanStack Query, Tailwind CSS + shadcn/ui, TypeScript estricto.
**Arquitectura:** Hexagonal + DDD (dominio sin dependencias de infraestructura).
**Deploy:** Vercel + GitHub (repositorio privado).

## Glosario

- **LoBeMo:** Empresa de seguridad informática para la cual se desarrolla el sistema.
- **Proyecto:** Compromiso con un cliente para entregar uno o más servicios de ciberseguridad (auditoría, pentesting, desarrollo seguro, capacitación, etc.).
- **Servicio:** Tipo de trabajo ofrecido por LoBeMo (Auditoría ISO 27001, Pentesting, Desarrollo Seguro, Consultoría en Redes, Capacitación, Soporte Técnico).
- **Propuesta:** Cotización formal enviada a un cliente antes de la aprobación del proyecto.
- **Cliente:** Organización (PYME, institución pública/privada) que contrata servicios de LoBeMo.
- **Empleado:** Colaborador de LoBeMo, con uno de los 11 roles definidos en el organigrama.
- **Hito:** Evento programado dentro de un proyecto (fecha de inicio de pruebas, entrega de informe, reunión de cierre, etc.).
- **Tarea:** Actividad atómica asignable a un empleado dentro de un proyecto.
- **AuditLog:** Registro de auditoría para toda operación CRUD del sistema.
- **Flujo de estados del proyecto:** Relevamiento → Propuesta → Aprobado → En Ejecución ↔ En Revisión → Entregado → Cerrado.
- **NOA:** Noroeste Argentino (Tucumán, Salta, Jujuy, Catamarca, Santiago del Estero).
- **CISO:** Chief Information Security Officer (Jefe de Seguridad Informática).

## Actores

| Rol | Área | Reporta a | Responsabilidades en el sistema |
|-----|------|-----------|-------------------------------|
| **Gerente General** | Gerencia | — | Crear/editar proyectos, aprobar propuestas, dashboard ejecutivo, gestionar empleados, ver informes de auditoría |
| **Administración y Contabilidad** | Administración | Gerencia | Gestionar clientes, emitir propuestas, seguimiento económico de proyectos |
| **Ventas y Atención al Cliente** | Comercial | Gerencia | Registrar clientes potenciales, crear oportunidades, seguimiento de propuestas |
| **Jefe de Seguridad Informática (CISO)** | Sistemas | Gerencia | Asignar empleados a proyectos, revisar hallazgos técnicos, aprobar entregas técnicas |
| **Analista de Seguridad** | Sistemas | CISO | Reportar hallazgos de seguridad, documentar incidentes, colaborar en auditorías |
| **Desarrollador de Software Seguro** | Sistemas | CISO | Registrar tareas de desarrollo, vincular entregables de código a proyectos |
| **Especialista en Redes** | Sistemas | CISO | Documentar configuraciones de red, reportar hallazgos de infraestructura |
| **Tester de Seguridad (Pentester)** | Sistemas | CISO | Registrar hallazgos de pentesting, documentar vulnerabilidades, generar informes |
| **Soporte Técnico** | Sistemas | CISO | Gestionar tickets de soporte vinculados a proyectos |
| **Auditor de Seguridad** | Auditoría | Gerencia (directo) | Generar planes de auditoría, documentar hallazgos, emitir informes de auditoría |
| **Capacitador en Ciberseguridad** | Capacitación | Gerencia (directo) | Crear programas de capacitación, registrar sesiones, gestionar materiales educativos |

## Requerimientos Funcionales (RF)

### Módulo de Autenticación y Empleados
- **RF-01:** El sistema debe permitir iniciar sesión con email y contraseña (Auth.js v5 con credentials provider).
- **RF-02:** El primer inicio de sesión debe crear automáticamente al Gerente General como superadmin.
- **RF-03:** El Gerente General debe poder crear, modificar y desactivar empleados asignándoles uno de los 11 roles predefinidos.
- **RF-04:** El sistema debe rechazar el registro de empleados con emails duplicados.
- **RF-05:** El sistema debe encriptar las contraseñas con bcrypt antes de almacenarlas.

### Módulo de Gestión de Clientes
- **RF-06:** El sistema debe permitir registrar clientes con: razón social, CUIT, email de contacto, teléfono, dirección y sector.
- **RF-07:** El sistema debe validar que el CUIT sea único entre clientes activos.
- **RF-08:** El sistema debe permitir desactivar clientes (borrado lógico) siempre que no tengan proyectos activos.
- **RF-09:** El sistema debe mostrar una lista paginada y filtrable de clientes.
- **RF-10:** El sistema debe permitir editar los campos del cliente; el cambio de CUIT requiere confirmación adicional.

### Módulo de Servicios
- **RF-11:** El sistema debe incluir 6 servicios predefinidos: Auditoría ISO 27001, Pentesting, Desarrollo Seguro, Consultoría en Redes, Capacitación y Soporte Técnico.
- **RF-12:** El sistema debe permitir editar la descripción y precio base de cada servicio.
- **RF-13:** El sistema debe impedir eliminar servicios que tengan proyectos asociados.

### Módulo de Proyectos
- **RF-14:** Solo el Gerente General o el CISO pueden crear proyectos.
- **RF-15:** El sistema debe gestionar el flujo de estados del proyecto: RELEVAMIENTO → PROPUESTA → APROBADO → EN_EJECUCION ↔ EN_REVISION → ENTREGADO → CERRADO.
- **RF-16:** El sistema debe validar las reglas de negocio RN-01 a RN-07 en cada transición de estado.
- **RF-17:** El sistema debe mostrar el estado actual del proyecto y su histórico de cambios de estado.
- **RF-18:** El sistema debe impedir marcar un proyecto como ENTREGADO si tiene tareas pendientes (RN-06).

### Módulo de Propuestas
- **RF-19:** El sistema debe asociar cada propuesta a un proyecto en estado RELEVAMIENTO o PROPUESTA.
- **RF-20:** El sistema debe permitir crear propuestas con: monto total, detalle de servicios (JSON flexible), fecha de emisión y fecha de vencimiento.
- **RF-21:** El sistema debe marcar automáticamente como RECHAZADAS las propuestas vencidas (RN-12).
- **RF-22:** El sistema debe permitir crear una nueva versión (recotización) de una propuesta rechazada.
- **RF-23:** Un proyecto solo puede pasar a APROBADO si la propuesta activa está en estado ACEPTADA.

### Módulo de Asignaciones
- **RF-24:** El CISO debe poder asignar empleados técnicos a proyectos en estado APROBADO o EN_EJECUCION.
- **RF-25:** El sistema debe validar que ningún empleado supere los 3 proyectos activos simultáneos (RN-08).
- **RF-26:** La asignación debe registrar el rol específico del empleado dentro del proyecto.
- **RF-27:** El sistema debe notificar automáticamente al empleado al ser asignado a un proyecto (RN-15a).
- **RF-28:** El Gerente General debe poder crear asignaciones en proyectos de las áreas de Auditoría y Capacitación (RN-14).

### Módulo de Tareas
- **RF-29:** Las tareas deben tener: título, descripción, estado (PENDIENTE, EN_PROGRESO, COMPLETADA, CANCELADA) y prioridad (BAJA, MEDIA, ALTA, CRITICA).
- **RF-30:** Un empleado solo puede crear y modificar tareas en proyectos donde está asignado.
- **RF-31:** El CISO y el Gerente General pueden ver y modificar todas las tareas de cualquier proyecto.
- **RF-32:** Al completar una tarea CRÍTICA, el sistema debe notificar automáticamente al CISO (RN-15d).
- **RF-33:** El sistema debe validar que todas las tareas estén COMPLETADA antes de permitir marcar un proyecto como ENTREGADO (RN-06).

### Módulo de Hitos
- **RF-34:** Los hitos deben contener: nombre, descripción, fecha prevista y fecha real de cumplimiento.
- **RF-35:** El sistema debe notificar a los involucrados 3 días antes de la fecha prevista de un hito.
- **RF-36:** El Gerente General y el CISO pueden crear y modificar hitos.

### Módulo de Dashboard
- **RF-37:** El dashboard debe mostrar: proyectos activos agrupados por estado, empleados ocupados vs disponibles, ingresos del mes y clientes nuevos.
- **RF-38:** Los datos del dashboard deben actualizarse en tiempo real mediante TanStack Query.
- **RF-39:** El dashboard debe permitir filtrar indicadores por rango de fechas.
- **RF-40:** El dashboard debe ser visible solo para los roles Gerente General, CISO y Administración.

### Módulo de Documentos
- **RF-41:** Los empleados técnicos deben poder adjuntar archivos (PDF, imágenes, Office, texto) a proyectos y tareas.
- **RF-42:** Los documentos deben clasificarse por tipo (INFORME_AUDITORIA, REPORTE_PENTESTING, CODIGO_FUENTE, CONFIG_RED, MATERIAL_CAPACITACION, CONTRATO, OTRO).
- **RF-43:** Solo los miembros del equipo del proyecto pueden ver sus documentos; Gerencia General y CISO pueden ver todos.

### Módulo de Notificaciones
- **RF-44:** El sistema debe generar notificaciones automáticas según las condiciones definidas en RN-15.
- **RF-45:** La interfaz debe mostrar un badge con la cantidad de notificaciones no leídas del usuario.
- **RF-46:** Las notificaciones deben marcarse como leídas al hacer clic en ellas.
- **RF-47:** Cada notificación debe incluir un enlace directo al recurso relacionado (proyecto, tarea, propuesta).

### Módulo de Auditoría y Compliance
- **RF-48:** El Auditor de Seguridad debe poder generar informes de auditoría con: alcance, criterios de auditoría, hallazgos, no conformidades, observaciones y recomendaciones.
- **RF-49:** Los informes de auditoría deben asociarse a proyectos de tipo AUDITORIA_ISO27001.
- **RF-50:** El Gerente General debe recibir una notificación al completarse un informe de auditoría.

### Módulo de Capacitaciones
- **RF-51:** El Capacitador debe poder crear programas de capacitación con: temario, duración, modalidad (presencial/remota) y materiales asociados.
- **RF-52:** El sistema debe permitir registrar asistentes a cada sesión y su evaluación de desempeño.
- **RF-53:** El sistema debe generar un certificado digital al completar satisfactoriamente la capacitación.

### Módulo de Pentesting
- **RF-54:** El Pentester debe poder registrar hallazgos con: título, descripción, severidad (CRITICA, ALTA, MEDIA, BAJA), evidencia y recomendación.
- **RF-55:** Los hallazgos de pentesting deben agruparse dentro de un proyecto de tipo PENTESTING.
- **RF-56:** El CISO debe poder revisar y aprobar cada hallazgo antes de incluirlo en el informe final.

### Módulo de Auditoría del Sistema (AuditLog)
- **RF-57:** El sistema debe registrar en AuditLog toda operación CREATE, UPDATE y DELETE sobre cualquier entidad (RN-09).
- **RF-58:** El AuditLog debe ser filtrable por entidad, empleado, rango de fechas y tipo de acción.
- **RF-59:** Solo el Gerente General debe poder acceder al AuditLog completo.

### Módulo de Soporte Técnico (post-MVP)
- **RF-60:** El Soporte Técnico debe poder gestionar tickets de asistencia vinculados a proyectos, con estado, prioridad y registro de resolución.

### Módulo de Métricas (post-MVP)
- **RF-61:** El CISO debe poder visualizar gráficos de avance, horas invertidas y tareas completadas por proyecto.

### Módulo de Exportación (post-MVP)
- **RF-62:** Los empleados deben poder exportar informes (auditoría, pentesting, estado del proyecto) a formato PDF.

### Módulo de Calendario (post-MVP)
- **RF-63:** El sistema debe mostrar un calendario integrado con todos los hitos y vencimientos de propuestas del usuario.

### Módulo de Configuración (post-MVP)
- **RF-64:** El Gerente General debe poder configurar parámetros del sistema (límite de proyectos activos por empleado, días de aviso de vencimiento, etc.).

## Requerimientos No Funcionales (RNF)

- **RNF-01 (Seguridad - Autenticación):** Las contraseñas deben almacenarse utilizando bcrypt con un costo mínimo de 12. Las sesiones deben manejarse mediante Auth.js v5 con JWT. El sistema debe implementar rate limiting en el endpoint de inicio de sesión para prevenir ataques de fuerza bruta.
- **RNF-02 (Seguridad - Comunicaciones):** Toda la comunicación debe realizarse exclusivamente a través de HTTPS. Los datos sensibles deben encriptarse tanto en tránsito (TLS 1.3) como en reposo (encriptación a nivel de base de datos).
- **RNF-03 (Seguridad - Validación):** El sistema debe validar y sanitizar todas las entradas de usuario siguiendo las guías OWASP Top 10. Debe implementar protección contra CSRF, XSS y SQL Injection.
- **RNF-04 (Rendimiento):** Las consultas a listas paginadas deben responder en menos de 2 segundos. El dashboard debe cargar los datos iniciales en menos de 3 segundos. El sistema debe soportar al menos 20 usuarios concurrentes sin degradación del servicio.
- **RNF-05 (Disponibilidad):** La aplicación debe tener una disponibilidad objetivo del 99.5% (impulsada por la infraestructura de Vercel + Neon). El sistema debe manejar correctamente la desconexión temporal de la base de datos mostrando mensajes amigables al usuario.
- **RNF-06 (Usabilidad):** La interfaz debe ser responsive (mobile-first) utilizando Tailwind CSS. Los componentes UI deben ser consistentes usando la librería shadcn/ui. Todos los formularios deben tener validación tanto en cliente (feedback inmediato) como en servidor (seguridad).
- **RNF-07 (Mantenibilidad):** El código debe seguir la arquitectura hexagonal, con separación estricta entre las capas de dominio, aplicación e infraestructura. Debe usar TypeScript en modo estricto en todo el código fuente. Debe cumplir los principios SOLID. El dominio no debe tener dependencias de infraestructura.
- **RNF-08 (Auditabilidad):** Todas las operaciones CRUD deben registrarse en AuditLog. Los registros de auditoría deben ser inmutables (solo inserción, sin modificación ni eliminación).
- **RNF-09 (Portabilidad):** El sistema debe ser deployable en Vercel. La base de datos debe ser PostgreSQL serverless (Neon). Los archivos deben almacenarse en Vercel Blob Storage o servicio equivalente con CDN.
- **RNF-10 (Pruebas):** La lógica de dominio debe tener cobertura de pruebas unitarias ≥ 80%. Los repositorios y adaptadores deben tener pruebas de integración. Se deben implementar pruebas E2E para los flujos críticos (login, creación de proyecto, cambio de estado).
- **RNF-11 (Manejo de errores):** El sistema debe implementar una jerarquía de errores por capa (DomainError, ApplicationError, InfrastructureError). Todos los errores deben tener un código único y un mensaje legible para el usuario. Los errores de infraestructura no deben filtrar detalles técnicos al frontend.
- **RNF-12 (Logging):** El sistema debe utilizar un sistema de logging estructurado (pino) con niveles (debug, info, warn, error). Cada log debe incluir contexto: usuario, entidad, acción y trace ID. No debe haber console.log en producción.

## Modelo de Dominio

### Entidades

#### Empleado
- `id` (UUID, PK)
- `nombre`, `apellido`, `email` (único)
- `rol` (enum: GERENTE_GENERAL, ADMINISTRACION, VENTAS, CISO, ANALISTA_SEGURIDAD, DESARROLLADOR, ESPECIALISTA_REDES, PENTESTER, SOPORTE_TECNICO, AUDITOR, CAPACITADOR)
- `area` (enum: GERENCIA, ADMINISTRACION, COMERCIAL, SISTEMAS, AUDITORIA, CAPACITACION)
- `fecha_ingreso` (date), `activo` (boolean)
- `created_at`, `updated_at`

#### Cliente
- `id` (UUID, PK)
- `razon_social`, `cuit` (único), `email_contacto`, `telefono`, `direccion`
- `sector` (enum: SALUD, CONTABLE_JURIDICO, COMERCIAL, LOGISTICA, AGROINDUSTRIA, GOBIERNO, OTRO)
- `fecha_registro` (date), `activo` (boolean)
- `created_at`, `updated_at`

#### Servicio
- `id` (UUID, PK)
- `nombre` (enum: AUDITORIA_ISO27001, PENTESTING, DESARROLLO_SEGURO, CONSULTORIA_REDES, CAPACITACION, SOPORTE_TECNICO)
- `descripcion` (text), `precio_base` (decimal, nullable)
- `created_at`, `updated_at`

#### Proyecto
- `id` (UUID, PK)
- `cliente_id` (FK → Cliente), `servicio_id` (FK → Servicio)
- `nombre`, `descripcion` (text)
- `estado` (enum: RELEVAMIENTO, PROPUESTA, APROBADO, EN_EJECUCION, EN_REVISION, ENTREGADO, CERRADO)
- `fecha_inicio`, `fecha_estimada_fin`, `fecha_entrega_real` (date, nullable)
- `monto_acordado` (decimal, nullable)
- `created_at`, `updated_at`

#### Propuesta
- `id` (UUID, PK)
- `proyecto_id` (FK → Proyecto)
- `version` (int), `monto_total` (decimal), `detalle_servicios` (JSON)
- `fecha_emision`, `fecha_vencimiento` (date)
- `estado` (enum: ENVIADA, ACEPTADA, RECHAZADA, RECOTIZADA)
- `created_at`, `updated_at`

#### Asignacion
- `id` (UUID, PK)
- `proyecto_id` (FK → Proyecto), `empleado_id` (FK → Empleado)
- `rol_en_proyecto` (string), `fecha_asignacion` (date)
- `created_at`, `updated_at`
- Unique constraint: (proyecto_id, empleado_id)

#### Tarea
- `id` (UUID, PK)
- `proyecto_id` (FK → Proyecto, nullable), `asignacion_id` (FK → Asignacion, nullable)
- `titulo`, `descripcion` (text, nullable)
- `estado` (enum: PENDIENTE, EN_PROGRESO, COMPLETADA, CANCELADA)
- `prioridad` (enum: BAJA, MEDIA, ALTA, CRITICA)
- `fecha_limite` (date, nullable)
- `created_at`, `updated_at`

#### Hito
- `id` (UUID, PK)
- `proyecto_id` (FK → Proyecto)
- `nombre`, `descripcion` (text, nullable)
- `fecha_prevista`, `fecha_real` (date, nullable), `completado` (boolean)
- `created_at`, `updated_at`

#### Documento
- `id` (UUID, PK)
- `proyecto_id` (FK → Proyecto, nullable), `tarea_id` (FK → Tarea, nullable)
- `nombre_archivo` (string)
- `tipo` (enum: INFORME_AUDITORIA, REPORTE_PENTESTING, CODIGO_FUENTE, CONFIG_RED, MATERIAL_CAPACITACION, CONTRATO, OTRO)
- `url` (string)
- `created_at`, `updated_at`

#### Notificacion
- `id` (UUID, PK)
- `empleado_id` (FK → Empleado)
- `titulo`, `mensaje` (text)
- `tipo` (enum: ASIGNACION_PROYECTO, CAMBIO_ESTADO, VENCIMIENTO, MENSAJE)
- `leida` (boolean, default false)
- `created_at`, `updated_at`

#### AuditLog
- `id` (UUID, PK)
- `empleado_id` (FK → Empleado, nullable)
- `accion` (enum: CREATE, UPDATE, DELETE)
- `entidad` (string), `entidad_id` (string), `detalle` (JSON, nullable)
- `created_at` (timestamp)

### Reglas de Negocio

- **RN-01:** Un proyecto comienza su vida en estado `RELEVAMIENTO`. Solo el Gerente General o el CISO pueden crear proyectos.
- **RN-02:** Un proyecto solo puede pasar a `PROPUESTA` si existe al menos una propuesta asociada.
- **RN-03:** Para que un proyecto pase de `PROPUESTA` a `APROBADO`, la propuesta debe estar en estado `ACEPTADA` y debe haber un monto acordado registrado.
- **RN-04:** Un proyecto no puede estar en `EN_EJECUCION` sin al menos un empleado TÉCNICO asignado (CISO, Analista de Seguridad, Desarrollador, Especialista en Redes, Pentester, Soporte Técnico, Auditor o Capacitador).
- **RN-05:** El estado `EN_REVISION` es un ciclo que puede ocurrir múltiples veces durante `EN_EJECUCION`. Solo el CISO o el Auditor pueden poner un proyecto en revisión.
- **RN-06:** Un proyecto solo puede marcarse como `ENTREGADO` si todas las tareas del proyecto están en estado `COMPLETADA`.
- **RN-07:** Un proyecto `CERRADO` no puede volver a ningún estado anterior (es terminal).
- **RN-08:** Un empleado no puede ser asignado a más de 3 proyectos activos (en estado `EN_EJECUCION` o `EN_REVISION`) simultáneamente.
- **RN-09:** Toda operación de creación, modificación o eliminación en cualquier entidad debe registrarse en `AuditLog`.
- **RN-10:** Solo el Gerente General puede crear/modificar/desactivar empleados.
- **RN-11:** Un cliente no puede eliminarse físicamente; solo puede desactivarse (borrado lógico). Si un cliente tiene proyectos activos, no puede desactivarse.
- **RN-12:** Las propuestas tienen una fecha de vencimiento. Si se vencen sin ser aceptadas ni rechazadas, pasan automáticamente a estado `RECHAZADA`.
- **RN-13:** El sistema debe validar que no haya duplicados de CUIT entre clientes activos.
- **RN-14:** El Capacitador y el Auditor reportan directamente a Gerencia General; sus proyectos pueden ser creados sin intervención del CISO.
- **RN-15:** El sistema debe generar una notificación automática cuando: (a) se asigna un empleado a un proyecto, (b) un proyecto cambia de estado, (c) una propuesta está próxima a vencer (3 días antes), (d) se completa una tarea crítica.

## User Stories

### Must Have (MVP)

#### US-021: Landing page con identidad visual LoBeMo (Tamaño: M)
**Como** visitante del sistema, **quiero** ver una landing page profesional con la identidad visual de LoBeMo **para** tener una presentación atractiva de la empresa al acceder a la raíz del sitio.
- AC-01: La página `/` debe aplicar el diseño del DESIGN_SYSTEM.md (dark mode, glassmorphism, geometría decorativa tipo Fortinet).
- AC-02: Debe mostrar: logo/nombre de LoBeMo, descripción del sistema, call-to-action para iniciar sesión.
- AC-03: Si no hay superadmin registrado, debe mostrar también enlace a "Primer inicio" (registro).
- AC-04: Debe incluir un footer con copyright y año dinámico.
- AC-05: Debe ser responsive (mobile-first).
- AC-06: Debe usar los tokens de color, tipografía y espaciado definidos en DESIGN_SYSTEM.md.

#### US-001: Autenticación y registro de empleados (Tamaño: M)
**Como** Gerente General, **quiero** iniciar sesión en el sistema y gestionar los empleados de LoBeMo **para** controlar quién accede al sistema y mantener actualizada la nómina del personal.
- AC-01: El sistema debe permitir iniciar sesión con email y contraseña (Auth.js v5 con credentials provider).
- AC-02: El primer inicio debe crear al Gerente General como superadmin.
- AC-03: El Gerente General puede crear nuevos empleados con los 11 roles predefinidos.
- AC-04: El sistema debe rechazar emails duplicados al crear empleados.
- AC-05: El sistema debe encriptar las contraseñas con bcrypt.

#### US-002: Gestión de clientes (Tamaño: S)
**Como** Administración/Ventas, **quiero** registrar y administrar los clientes de LoBeMo **para** mantener una base de datos actualizada de organizaciones que contratan nuestros servicios.
- AC-01: El formulario incluye: razón social, CUIT, email de contacto, teléfono, dirección, sector.
- AC-02: El sistema valida CUIT único entre clientes activos.
- AC-03: Los clientes pueden desactivarse (borrado lógico) si no tienen proyectos activos.
- AC-04: El sistema muestra una lista paginada y filtrable de clientes.
- AC-05: Se puede editar cualquier campo excepto CUIT (que requiere confirmación adicional).

#### US-003: Registro de servicios (Tamaño: XS)
**Como** Gerente General, **quiero** configurar los tipos de servicio que ofrece LoBeMo **para** que los proyectos puedan asociarse al servicio correspondiente.
- AC-01: Los servicios predefinidos son: Auditoría ISO 27001, Pentesting, Desarrollo Seguro, Consultoría en Redes, Capacitación, Soporte Técnico.
- AC-02: Se puede editar la descripción y precio base de cada servicio.
- AC-03: No se pueden eliminar servicios con proyectos asociados.

#### US-004: Creación y ciclo de vida del proyecto (Tamaño: L)
**Como** Gerente General, **quiero** crear un proyecto, asignarle un cliente y un servicio, y hacerlo avanzar por sus estados **para** gestionar el ciclo de vida completo de cada compromiso con el cliente.
- AC-01: Solo Gerente General o CISO pueden crear proyectos.
- AC-02: Los estados del proyecto siguen el flujo: RELEVAMIENTO → PROPUESTA → APROBADO → EN_EJECUCION ↔ EN_REVISION → ENTREGADO → CERRADO.
- AC-03: Las transiciones de estado validan las reglas de negocio RN-01 a RN-07.
- AC-04: El sistema muestra el estado actual y el histórico de cambios.
- AC-05: El proyecto no puede pasar a ENTREGADO si tiene tareas pendientes (RN-06).

#### US-005: Gestión de propuestas (Tamaño: M)
**Como** Administración/Ventas, **quiero** crear y enviar propuestas económicas a los clientes **para** cotizar los servicios antes de la aprobación del proyecto.
- AC-01: Una propuesta se asocia a un proyecto en estado RELEVAMIENTO o PROPUESTA.
- AC-02: El formulario incluye: monto total, detalle de servicios (JSON flexible), fecha de emisión y vencimiento.
- AC-03: Las propuestas vencidas se marcan automáticamente como RECHAZADAS (RN-12).
- AC-04: Se puede crear una nueva versión (recotización) de una propuesta rechazada.
- AC-05: Solo si la propuesta se ACEPTA, el proyecto puede pasar a APROBADO.

#### US-006: Asignación de empleados a proyectos (Tamaño: M)
**Como** CISO, **quiero** asignar empleados técnicos a los proyectos **para** conformar el equipo de trabajo según las necesidades del servicio.
- AC-01: El CISO asigna empleados a proyectos en estado APROBADO o EN_EJECUCION.
- AC-02: El sistema valida RN-08 (máximo 3 proyectos activos por empleado).
- AC-03: La asignación registra el rol específico dentro del proyecto.
- AC-04: El empleado recibe una notificación automática al ser asignado (RN-15a).
- AC-05: Las asignaciones de proyectos de Auditoría y Capacitación pueden ser creadas por el Gerente General (RN-14).

#### US-007: Gestión de tareas (Tamaño: M)
**Como** Empleado técnico, **quiero** crear y gestionar mis tareas dentro de un proyecto **para** organizar el trabajo y registrar mi avance.
- AC-01: Las tareas tienen: título, descripción, estado (PENDIENTE, EN_PROGRESO, COMPLETADA, CANCELADA) y prioridad.
- AC-02: Un empleado solo puede crear/modificar tareas en proyectos donde está asignado.
- AC-03: El CISO y Gerente General pueden ver y modificar todas las tareas del proyecto.
- AC-04: Al completar una tarea CRÍTICA, se notifica al CISO (RN-15d).
- AC-05: El sistema valida RN-06 al marcar un proyecto como ENTREGADO.

#### US-008: Gestión de hitos (Tamaño: S)
**Como** CISO, **quiero** definir hitos dentro de un proyecto **para** controlar las fechas clave y el progreso del equipo.
- AC-01: Los hitos tienen: nombre, descripción, fecha prevista y fecha real de cumplimiento.
- AC-02: El sistema notifica 3 días antes de la fecha prevista de un hito.
- AC-03: El Gerente General y el CISO pueden crear/modificar hitos.

#### US-009: Dashboard ejecutivo (Tamaño: L)
**Como** Gerente General, **quiero** ver un dashboard con indicadores clave de la empresa **para** tomar decisiones informadas sobre el negocio.
- AC-01: El dashboard muestra: proyectos activos por estado, empleados ocupados vs disponibles, ingresos del mes, clientes nuevos.
- AC-02: Los datos se actualizan en tiempo real (con TanStack Query).
- AC-03: Se pueden filtrar por rango de fechas.
- AC-04: El dashboard es visible solo para Gerente General, CISO y Administración.

### Should Have

#### US-010: Carga y gestión de documentos (Tamaño: M)
**Como** Empleado técnico, **quiero** adjuntar documentos (informes, código, configuraciones) a proyectos y tareas **para** centralizar la documentación de cada servicio.

#### US-011: Sistema de notificaciones (Tamaño: S)
**Como** Empleado, **quiero** recibir notificaciones sobre asignaciones, cambios de estado y vencimientos **para** estar al tanto de lo que ocurre en mis proyectos.

#### US-012: Informes de auditoría (cumplimiento normativo) (Tamaño: M)
**Como** Auditor de Seguridad, **quiero** generar informes de auditoría dentro de un proyecto **para** documentar hallazgos, no conformidades y recomendaciones.

#### US-013: Gestión de capacitaciones (Tamaño: M)
**Como** Capacitador en Ciberseguridad, **quiero** crear programas de capacitación, registrar sesiones y evaluar asistentes **para** ofrecer servicios de formación a clientes.

#### US-014: Reporte de hallazgos de pentesting (Tamaño: M)
**Como** Pentester, **quiero** registrar vulnerabilidades encontradas durante las pruebas de penetración **para** documentarlas y generar el informe técnico final.

#### US-015: Historial de auditoría (AuditLog) (Tamaño: S)
**Como** Gerente General, **quiero** consultar el historial completo de cambios en el sistema **para** auditar quién hizo qué y cuándo.

### Could Have (post-MVP)

#### US-016: Gestión de tickets de soporte técnico (Tamaño: M)
**Como** Soporte Técnico, **quiero** gestionar tickets de asistencia de clientes vinculados a proyectos **para** dar seguimiento a incidentes y solicitudes.

#### US-017: Métricas y gráficos por proyecto (Tamaño: M)
**Como** CISO, **quiero** ver gráficos de avance, horas invertidas y tareas completadas por proyecto **para** evaluar el desempeño del equipo.

#### US-018: Exportación de informes a PDF (Tamaño: S)
**Como** Empleado, **quiero** exportar informes (auditoría, pentesting, estado del proyecto) a PDF **para** compartirlos con clientes de forma profesional.

#### US-019: Calendario de hitos y vencimientos (Tamaño: M)
**Como** Empleado, **quiero** ver un calendario con todos los hitos y vencimientos de propuestas **para** planificar mi trabajo semanal.

#### US-020: Panel de administración (configuración del sistema) (Tamaño: S)
**Como** Gerente General, **quiero** configurar parámetros del sistema (límite de proyectos activos por empleado, días de aviso de vencimiento, etc.) **para** adaptar el sistema a las necesidades cambiantes de la empresa.

## Supuestos

- **S-01:** El sistema es de uso interno exclusivo de LoBeMo (single-tenant). No hay registro público ni multi-cliente.
- **S-02:** No se requiere integración con AFIP, facturación electrónica ni pasarela de pagos real.
- **S-03:** El almacenamiento de documentos se hará en Vercel Blob Storage.
- **S-04:** El sistema asume que los 11 empleados de LoBeMo estarán registrados desde el inicio.
- **S-05:** Los 6 tipos de servicio están predefinidos y no se agregarán nuevos sin una actualización del sistema.
- **S-06:** No se requiere app móvil nativa; la interfaz web es responsive (mobile-first).
- **S-07:** Las notificaciones son solo intra-sistema (no email/SMS en MVP).
- **S-08:** El flujo de estados del proyecto es el definido en los TPs y no requiere personalización por cliente.
- **S-09:** No se manejan múltiples monedas; todo en ARS.
- **S-10:** Se asume conectividad a Internet (Neon serverless + Vercel).

## Open Questions

- **OQ-01:** ¿Se desea integración con calendario externo (Google Calendar) para los hitos?
- **OQ-02:** ¿El dashboard ejecutivo necesita exportación a Excel/CSV?
- **OQ-03:** ¿Se requiere un sistema de roles y permisos más granular (ej: permisos por entidad) o el modelo actual (rol define permisos) es suficiente?
- **OQ-04:** ¿Los certificados de capacitación deben generarse automáticamente como PDF o basta con un registro en el sistema?
- **OQ-05:** ¿El sistema debe soportar la carga de evidencias (capturas, logs) en los hallazgos de pentesting?
- **OQ-06:** ¿Se desea que las propuestas puedan enviarse por email desde el sistema en el futuro?
