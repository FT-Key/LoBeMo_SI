# Requirements: LoBeMo Seguridad Informatica - Sistema de Gestion de Proyectos de Ciberseguridad

## Resumen Ejecutivo

LoBeMo Seguridad Informatica es una empresa tucumana especializada en ciberseguridad, con 11 colaboradores organizados en 4 areas (Gerencia, Administracion, Comercial, Sistemas) mas dos roles que reportan directamente a Gerencia (Auditoria y Capacitacion). La empresa brinda servicios de auditoria de seguridad, pentesting, desarrollo de software seguro, monitoreo de redes, consultoria en ciberseguridad y capacitacion.

Se desarrollara un sistema de gestion interno (web app) que permita a LoBeMo administrar sus proyectos de ciberseguridad, clientes, propuestas, recursos humanos y la trazabilidad completa del ciclo de vida de cada servicio. El sistema es single-tenant (solo para LoBeMo).

**Stack tecnologico:** Next.js 15 App Router, Prisma, PostgreSQL (Neon serverless), Auth.js v5, TanStack Query, Tailwind CSS + shadcn/ui, TypeScript estricto.
**Arquitectura:** Hexagonal + DDD (dominio sin dependencias de infraestructura).
**Deploy:** Vercel + GitHub (repositorio privado).

## Glosario

- **LoBeMo:** Empresa de seguridad informatica para la cual se desarrolla el sistema.
- **Proyecto:** Compromiso con un cliente para entregar uno o mas servicios de ciberseguridad (auditoria, pentesting, desarrollo seguro, capacitacion, etc.).
- **Servicio:** Tipo de trabajo ofrecido por LoBeMo (Auditoria ISO 27001, Pentesting, Desarrollo Seguro, Consultoria en Redes, Capacitacion, Soporte Tecnico).
- **Propuesta:** Cotizacion formal enviada a un cliente antes de la aprobacion del proyecto.
- **Cliente:** Organizacion (PYME, institucion publica/privada) que contrata servicios de LoBeMo.
- **Empleado:** Colaborador de LoBeMo, con uno de los 11 roles definidos en el organigrama.
- **Hito:** Evento programado dentro de un proyecto (fecha de inicio de pruebas, entrega de informe, reunion de cierre, etc.).
- **Tarea:** Actividad atomica asignable a un empleado dentro de un proyecto.
- **AuditLog:** Registro de auditoria para toda operacion CRUD del sistema.
- **Flujo de estados del proyecto:** Relevamiento, Propuesta, Aprobado, En Ejecucion, En Revision, Entregado, Cerrado.
- **NOA:** Noroeste Argentino (Tucuman, Salta, Jujuy, Catamarca, Santiago del Estero).
- **CISO:** Chief Information Security Officer (Jefe de Seguridad Informatica).

## Actores

| Rol | Area | Reporta a | Responsabilidades en el sistema |
|-----|------|-----------|-------------------------------|
| **Gerente General** | Gerencia | - | Crear/editar proyectos, aprobar propuestas, dashboard ejecutivo, gestionar empleados, ver informes de auditoria |
| **Administracion y Contabilidad** | Administracion | Gerencia | Gestionar clientes, emitir propuestas, seguimiento economico de proyectos |
| **Ventas y Atencion al Cliente** | Comercial | Gerencia | Registrar clientes potenciales, crear oportunidades, seguimiento de propuestas |
| **Jefe de Seguridad Informatica (CISO)** | Sistemas | Gerencia | Asignar empleados a proyectos, revisar hallazgos tecnicos, aprobar entregas tecnicas |
| **Analista de Seguridad** | Sistemas | CISO | Reportar hallazgos de seguridad, documentar incidentes, colaborar en auditorias |
| **Desarrollador de Software Seguro** | Sistemas | CISO | Registrar tareas de desarrollo, vincular entregables de codigo a proyectos |
| **Especialista en Redes** | Sistemas | CISO | Documentar configuraciones de red, reportar hallazgos de infraestructura |
| **Tester de Seguridad (Pentester)** | Sistemas | CISO | Registrar hallazgos de pentesting, documentar vulnerabilidades, generar informes |
| **Soporte Tecnico** | Sistemas | CISO | Gestionar tickets de soporte vinculados a proyectos |
| **Auditor de Seguridad** | Auditoria | Gerencia (directo) | Generar planes de auditoria, documentar hallazgos, emitir informes de auditoria |
| **Capacitador en Ciberseguridad** | Capacitacion | Gerencia (directo) | Crear programas de capacitacion, registrar sesiones, gestionar materiales educativos |

## User Stories

### Must Have (MVP)

#### US-021: Landing page con identidad visual LoBeMo (Tamano: M)
**Como** visitante del sistema, **quiero** ver una landing page profesional con la identidad visual de LoBeMo **para** tener una presentacion atractiva de la empresa al acceder a la raiz del sitio.
- AC-01: La pagina `/` debe aplicar el diseno del DESIGN_SYSTEM.md (dark mode, glassmorphism, geometria decorativa tipo Fortinet).
- AC-02: Debe mostrar: logo/nombre de LoBeMo, descripcion del sistema, call-to-action para iniciar sesion.
- AC-03: Si no hay superadmin registrado, debe mostrar tambien enlace a "Primer inicio" (registro).
- AC-04: Debe incluir un footer con copyright y ano dinamico.
- AC-05: Debe ser responsive (mobile-first).
- AC-06: Debe usar los tokens de color, tipografia y espaciado definidos en DESIGN_SYSTEM.md.

#### US-001: Autenticacion y registro de empleados (Tamano: M)
**Como** Gerente General, **quiero** iniciar sesion en el sistema y gestionar los empleados de LoBeMo **para** controlar quien accede al sistema y mantener actualizada la nomina del personal.
- AC-01: El sistema debe permitir iniciar sesion con email y contrasena (Auth.js v5 con credentials provider).
- AC-02: El primer inicio debe crear al Gerente General como superadmin.
- AC-03: El Gerente General puede crear nuevos empleados con los 11 roles predefinidos.
- AC-04: El sistema debe rechazar emails duplicados al crear empleados.
- AC-05: El sistema debe encriptar las contrasenas con bcrypt.

#### US-002: Gestion de clientes (Tamano: S)
**Como** Administracion/Ventas, **quiero** registrar y administrar los clientes de LoBeMo **para** mantener una base de datos actualizada de organizaciones que contratan nuestros servicios.
- AC-01: El formulario incluye: razon social, CUIT, email de contacto, telefono, direccion, sector.
- AC-02: El sistema valida CUIT unico entre clientes activos.
- AC-03: Los clientes pueden desactivarse (borrado logico) si no tienen proyectos activos.
- AC-04: El sistema muestra una lista paginada y filtrable de clientes.
- AC-05: Se puede editar cualquier campo excepto CUIT (que requiere confirmacion adicional).

#### US-003: Registro de servicios (Tamano: XS)
**Como** Gerente General, **quiero** configurar los tipos de servicio que ofrece LoBeMo **para** que los proyectos puedan asociarse al servicio correspondiente.
- AC-01: Los servicios predefinidos son: Auditoria ISO 27001, Pentesting, Desarrollo Seguro, Consultoria en Redes, Capacitacion, Soporte Tecnico.
- AC-02: Se puede editar la descripcion y precio base de cada servicio.
- AC-03: No se pueden eliminar servicios con proyectos asociados.

#### US-004: Creacion y ciclo de vida del proyecto (Tamano: L)
**Como** Gerente General, **quiero** crear un proyecto, asignarle un cliente y un servicio, y hacerlo avanzar por sus estados **para** gestionar el ciclo de vida completo de cada compromiso con el cliente.
- AC-01: Solo Gerente General o CISO pueden crear proyectos.
- AC-02: Los estados del proyecto siguen el flujo: RELEVAMIENTO, PROPUESTA, APROBADO, EN_EJECUCION, EN_REVISION, ENTREGADO, CERRADO.
- AC-03: Las transiciones de estado validan las reglas de negocio RN-01 a RN-07.
- AC-04: El sistema muestra el estado actual y el historico de cambios.
- AC-05: El proyecto no puede pasar a ENTREGADO si tiene tareas pendientes (RN-06).

#### US-005: Gestion de propuestas (Tamano: M)
**Como** Administracion/Ventas, **quiero** crear y enviar propuestas economicas a los clientes **para** cotizar los servicios antes de la aprobacion del proyecto.
- AC-01: Una propuesta se asocia a un proyecto en estado RELEVAMIENTO o PROPUESTA.
- AC-02: El formulario incluye: monto total, detalle de servicios (JSON flexible), fecha de emision y vencimiento.
- AC-03: Las propuestas vencidas se marcan automaticamente como RECHAZADAS (RN-12).
- AC-04: Se puede crear una nueva version (recotizacion) de una propuesta rechazada.
- AC-05: Solo si la propuesta se ACEPTA, el proyecto puede pasar a APROBADO.

#### US-006: Asignacion de empleados a proyectos (Tamano: M)
**Como** CISO, **quiero** asignar empleados tecnicos a los proyectos **para** conformar el equipo de trabajo segun las necesidades del servicio.
- AC-01: El CISO asigna empleados a proyectos en estado APROBADO o EN_EJECUCION.
- AC-02: El sistema valida RN-08 (maximo 3 proyectos activos por empleado).
- AC-03: La asignacion registra el rol especifico dentro del proyecto.
- AC-04: El empleado recibe una notificacion automatica al ser asignado (RN-15a).
- AC-05: Las asignaciones de proyectos de Auditoria y Capacitacion pueden ser creadas por el Gerente General (RN-14).

#### US-007: Gestion de tareas (Tamano: M)
**Como** Empleado tecnico, **quiero** crear y gestionar mis tareas dentro de un proyecto **para** organizar el trabajo y registrar mi avance.
- AC-01: Las tareas tienen: titulo, descripcion, estado (PENDIENTE, EN_PROGRESO, COMPLETADA, CANCELADA) y prioridad.
- AC-02: Un empleado solo puede crear/modificar tareas en proyectos donde esta asignado.
- AC-03: El CISO y Gerente General pueden ver y modificar todas las tareas del proyecto.
- AC-04: Al completar una tarea CRITICA, se notifica al CISO (RN-15d).
- AC-05: El sistema valida RN-06 al marcar un proyecto como ENTREGADO.

#### US-008: Gestion de hitos (Tamano: S)
**Como** CISO, **quiero** definir hitos dentro de un proyecto **para** controlar las fechas clave y el progreso del equipo.
- AC-01: Los hitos tienen: nombre, descripcion, fecha prevista y fecha real de cumplimiento.
- AC-02: El sistema notifica 3 dias antes de la fecha prevista de un hito.
- AC-03: El Gerente General y el CISO pueden crear/modificar hitos.

#### US-009: Dashboard ejecutivo (Tamano: L)
**Como** Gerente General, **quiero** ver un dashboard con indicadores clave de la empresa **para** tomar decisiones informadas sobre el negocio.
- AC-01: El dashboard muestra: proyectos activos por estado, empleados ocupados vs disponibles, ingresos del mes, clientes nuevos.
- AC-02: Los datos se actualizan en tiempo real (con TanStack Query).
- AC-03: Se pueden filtrar por rango de fechas.
- AC-04: El dashboard es visible solo para Gerente General, CISO y Administracion.

### Should Have

#### US-010: Carga y gestion de documentos (Tamano: M)
**Como** Empleado tecnico, **quiero** adjuntar documentos (informes, codigo, configuraciones) a proyectos y tareas **para** centralizar la documentacion de cada servicio.

#### US-011: Sistema de notificaciones (Tamano: S)
**Como** Empleado, **quiero** recibir notificaciones sobre asignaciones, cambios de estado y vencimientos **para** estar al tanto de lo que ocurre en mis proyectos.

#### US-012: Informes de auditoria (cumplimiento normativo) (Tamano: M)
**Como** Auditor de Seguridad, **quiero** generar informes de auditoria dentro de un proyecto **para** documentar hallazgos, no conformidades y recomendaciones.

#### US-013: Gestion de capacitaciones (Tamano: M)
**Como** Capacitador en Ciberseguridad, **quiero** crear programas de capacitacion, registrar sesiones y evaluar asistentes **para** ofrecer servicios de formacion a clientes.

#### US-014: Reporte de hallazgos de pentesting (Tamano: M)
**Como** Pentester, **quiero** registrar vulnerabilidades encontradas durante las pruebas de penetracion **para** documentarlas y generar el informe tecnico final.

#### US-015: Historial de auditoria (AuditLog) (Tamano: S)
**Como** Gerente General, **quiero** consultar el historial completo de cambios en el sistema **para** auditar quien hizo que y cuando.

### Could Have (post-MVP)

#### US-016: Gestion de tickets de soporte tecnico (Tamano: M)
**Como** Soporte Tecnico, **quiero** gestionar tickets de asistencia de clientes vinculados a proyectos **para** dar seguimiento a incidentes y solicitudes.

#### US-017: Metricas y graficos por proyecto (Tamano: M)
**Como** CISO, **quiero** ver graficos de avance, horas invertidas y tareas completadas por proyecto **para** evaluar el desempeno del equipo.

#### US-018: Exportacion de informes a PDF (Tamano: S)
**Como** Empleado, **quiero** exportar informes (auditoria, pentesting, estado del proyecto) a PDF **para** compartirlos con clientes de forma profesional.

#### US-019: Calendario de hitos y vencimientos (Tamano: M)
**Como** Empleado, **quiero** ver un calendario con todos los hitos y vencimientos de propuestas **para** planificar mi trabajo semanal.

#### US-020: Panel de administracion (configuracion del sistema) (Tamano: S)
**Como** Gerente General, **quiero** configurar parametros del sistema (limite de proyectos activos por empleado, dias de aviso de vencimiento, etc.) **para** adaptar el sistema a las necesidades cambiantes de la empresa.

## Supuestos

- **S-01:** El sistema es de uso interno exclusivo de LoBeMo (single-tenant). No hay registro publico ni multi-cliente.
- **S-02:** No se requiere integracion con AFIP, facturacion electronica ni pasarela de pagos real.
- **S-03:** El almacenamiento de documentos se hara en Vercel Blob Storage.
- **S-04:** El sistema asume que los 11 empleados de LoBeMo estaran registrados desde el inicio.
- **S-05:** Los 6 tipos de servicio estan predefinidos y no se agregaran nuevos sin una actualizacion del sistema.
- **S-06:** No se requiere app movil nativa; la interfaz web es responsive (mobile-first).
- **S-07:** Las notificaciones son solo intra-sistema (no email/SMS en MVP).
- **S-08:** El flujo de estados del proyecto es el definido en los TPs y no requiere personalizacion por cliente.
- **S-09:** No se manejan multiples monedas; todo en ARS.
- **S-10:** Se asume conectividad a Internet (Neon serverless + Vercel).

## Open Questions

- **OQ-01:** Se desea integracion con calendario externo (Google Calendar) para los hitos?
- **OQ-02:** El dashboard ejecutivo necesita exportacion a Excel/CSV?
- **OQ-03:** Se requiere un sistema de roles y permisos mas granular (ej: permisos por entidad) o el modelo actual (rol define permisos) es suficiente?
- **OQ-04:** Los certificados de capacitacion deben generarse automaticamente como PDF o basta con un registro en el sistema?
- **OQ-05:** El sistema debe soportar la carga de evidencias (capturas, logs) en los hallazgos de pentesting?
- **OQ-06:** Se desea que las propuestas puedan enviarse por email desde el sistema en el futuro?