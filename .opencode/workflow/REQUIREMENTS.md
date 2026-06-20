# Requirements: LoBeMo Seguridad Informatica - Sistema de Gestion de Proyectos de Ciberseguridad

## Resumen Ejecutivo

LoBeMo Seguridad Informatica es una empresa tucumana especializada en ciberseguridad, con 11 colaboradores organizados en 4 areas (Gerencia, Administracion, Comercial, Sistemas) mas dos roles que reportan directamente a Gerencia (Auditoria y Capacitacion). La empresa brinda servicios de auditoria de seguridad, pentesting, desarrollo de software seguro, monitoreo de redes, consultoria en ciberseguridad y capacitacion.

Se desarrollara un sistema de gestion interno (web app) que permita a LoBeMo administrar sus proyectos de ciberseguridad, clientes, propuestas, recursos humanos y la trazabilidad completa del ciclo de vida de cada servicio. El sistema es single-tenant (solo para LoBeMo).

**Stack tecnologico:** Next.js 16 App Router, Prisma v7, PostgreSQL (Neon serverless), Auth.js v5, TanStack Query, Tailwind CSS + shadcn/ui, TypeScript estricto.
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

**Requerimientos de diseno general:**
- RG-01: La pagina `/` debe aplicar estrictamente los tokens del DESIGN_SYSTEM.md: dark mode como modo principal (claro secundario), paleta teal+amber, tipografia Plus Jakarta Sans para headings e Inter para body.
- RG-02: Debe usar glassmorphism en cards y contenedores (background semi-transparente + backdrop-blur + bordes sutiles).
- RG-03: Debe incluir geometria decorativa tipo Fortinet: rombos/diamantes rotados 45°, rayos diagonales irradiando desde esquinas, triangulos superpuestos con opacidad 5-10% (SVG inline o pseudo-elementos con clip-path).
- RG-04: Debe tener gradientes decorativos teal-amber en secciones destacadas.
- RG-05: Debe ser fully responsive (mobile-first): 1 columna en mobile, layout expandido en desktop.
- RG-06: Las animaciones deben ser suaves (transitions 200ms, fade-in en entrada de pagina).
- RG-07: No debe requerir autenticacion para acceder - es la puerta de entrada al sistema.

---

**Secciones de la landing page:**

##### Seccion 1: Hero - "Encabezado principal" (viewport completo)
- Ocupa el 100% del viewport height (`min-h-screen`).
- Fondo oscuro con geometria decorativa predominante: rombos animados en teal-dark y amber-dark, mas rayos diagonales desde esquina superior derecha (estilo radar Fortinet).
- Logotipo LoBeMo centrado o en la parte superior (texto "LoBeMo Seguridad Informatica" con la palabra "LoBeMo" en teal primary y "Seguridad Informatica" en foreground).
- Tagline principal: texto grande (h1) con peso bold, ej: "Seguridad informatica con identidad regional" o similar.
- Descripcion breve: texto cuerpo (`max-w-2xl`) explicando que el sistema es la plataforma de gestion de proyectos de ciberseguridad de LoBeMo.
- Call-to-action principal: Boton primary grande (teal) con texto "Iniciar Sesion" -> redirige a `/login`.
- Call-to-action secundario: Si no existe ningun superadmin registrado en la base de datos, mostrar ademas un boton outline/accent con texto "Primer inicio - Registrar empresa" -> redirige a `/register`.
- Mockup visual: Un mockup/imagen decorativa de un dashboard o interfaz de seguridad (SVG abstracto) a la derecha del texto en desktop, debajo en mobile.
- Efecto de parallax sutil en la geometria de fondo (opcional, degrada performance si es excesivo).

##### Seccion 2: Servicios - "Nuestros servicios" (glassmorphism cards grid)
- Titulo h2: "Servicios de ciberseguridad" con un subrayado decorativo teal.
- Grid de 6 cards en glassmorphism (3 columnas desktop, 2 tablet, 1 mobile).
- Cada card representa un servicio de LoBeMo:
  1. **Auditoria ISO 27001** - Icono: Shield (Lucide)
  2. **Pentesting** - Icono: Bug (Lucide)
  3. **Desarrollo Seguro** - Icono: Code (Lucide)
  4. **Consultoria en Redes** - Icono: Network (Lucide)
  5. **Capacitacion** - Icono: GraduationCap (Lucide)
  6. **Soporte Tecnico** - Icono: Wrench (Lucide)
- Cada card tiene: icono grande teal, titulo en semibold, descripcion corta, badge con precio base (si esta configurado) o "A consultar".
- Al hacer hover: la card se eleva (`translateY -2px`), el borde se aclara, el icono cambia a amber sutil.
- La grid usa `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.

##### Seccion 3: Cifras - "LoBeMo en numeros" (trust indicators)
- Fondo con gradiente tenue `bg-gradient-to-b from-primary-dark/30 to-background`.
- Titulo h2: "Confian en nosotros" o "Nuestra presencia".
- 4 indicadores grandes con animacion de conteo (opcional, puede ser estatico):
  - **X+ anos** de experiencia en ciberseguridad
  - **Y+ clientes** en el NOA
  - **Z+ proyectos** ejecutados
  - **11 especialistas** en el equipo
- Cada indicador: numero grande (`text-4xl`/`text-5xl`) en teal o amber, label debajo en `muted-foreground`.
- Grid de 4 columnas desktop, 2 tablet, 1 mobile.
- Nota: los numeros pueden ser hardcodeados como placeholder. Para MVP se usaran valores fijos representativos.

##### Seccion 4: Diferenciadores - "Por que LoBeMo?" (features highlight)
- Titulo h2: "Seguridad con identidad regional".
- 3 columnas de features con icono + texto:
  1. **Expertos en el NOA** - Conocemos el ecosistema tecnologico del noroeste argentino.
  2. **Atencion personalizada** - Cada cliente recibe un plan a medida, sin soluciones genericas.
  3. **Compromiso total** - Acompanamiento continuo desde el diagnostico hasta la implementacion.
- Cada feature: icono grande (Lucide, tamano `h-12 w-12`) en un contenedor circular con fondo `primary-dark/30` y borde `teal/20`, titulo h3, descripcion body-sm.
- Animacion de entrada: fade-in + slide-in-from-bottom para cada columna.

##### Seccion 5: Contacto / CTA final (antes del footer)
- Fondo oscuro con geometria decorativa sutil.
- Titulo h2: "Listo para proteger tu organizacion?"
- Boton primary grande: "Iniciar Sesion" (si ya hay superadmin) o "Comenzar ahora" (si no).
- Texto secundario: "Accede al sistema de gestion de proyectos de LoBeMo."
- Separacion visual con el footer mediante gradiente teal-transparente.

##### Seccion 6: Footer
- Fondo: `bg-surface` (modo oscuro) o `bg-muted` (modo claro).
- Layout: 3 columnas en desktop, apiladas en mobile.
  - **Columna 1**: Logo LoBeMo pequeno + breve descripcion de la empresa.
  - **Columna 2**: Enlaces rapidos (Iniciar Sesion, Servicios - ambos internos, sin ruta definida aun). Para MVP: solo texto "Iniciar Sesion" y "Servicios" como placeholders.
  - **Columna 3**: Contacto (Tucuman, Argentina) con iconos de MapPin, Mail, Phone (opcional - puede omitirse si no hay datos reales).
- Linea divisoria con gradiente teal-transparente.
- Copyright: "(c) {ano} LoBeMo Seguridad Informatica. Todos los derechos reservados." con ano dinamico via JavaScript (`new Date().getFullYear()`).
- Texto en `muted-foreground`, tamano small/caption.

---

**Estados y condiciones:**
- **Estado A (sin superadmin)**: Hero muestra ambos CTAs (Iniciar Sesion + Primer inicio). El boton "Primer inicio" debe destacar ligeramente (badge "Nuevo" o variante accent).
- **Estado B (con superadmin)**: Hero muestra solo "Iniciar Sesion". No aparece el enlace de registro.
- **Responsive**: En mobile (< 768px), el hero debe apilarse verticalmente. Las grids pasan a 1 columna. Los indicadores numericos se reducen a `text-2xl`. El layout se vuelve compacto.
- **Loading**: Mientras se verifica si existe superadmin, mostrar un skeleton de la landing page (placeholder gris con `animate-pulse`).
- **Error**: Si falla la verificacion de superadmin, mostrar un mensaje generico y ocultar el CTA de registro (mostrar solo "Iniciar Sesion" como fallback seguro).

---

**Criterios de aceptacion:**
- AC-01: La pagina `/` debe aplicar el diseno del DESIGN_SYSTEM.md (dark mode, glassmorphism, geometria decorativa).
- AC-02: Hero debe mostrar logo, tagline, descripcion, y boton CTA para iniciar sesion.
- AC-03: Si no existe superadmin, debe mostrar boton "Primer inicio - Registrar empresa".
- AC-04: La seccion de servicios debe renderizar 6 cards con iconos matching cada tipo de servicio.
- AC-05: La seccion de cifras debe mostrar 4 indicadores de confianza con numeros estilizados.
- AC-06: La seccion de diferenciadores debe mostrar 3 columnas con iconos.
- AC-07: La seccion CTA final debe incluir un boton de login/registro.
- AC-08: El footer debe incluir copyright dinamico con el ano actual y layout de 3 columnas en desktop.
- AC-09: La pagina debe ser responsive (mobile-first): 1 columna en mobile, multi-columna en desktop.
- AC-10: Todos los colores, tipografia y espaciado deben usar exclusivamente tokens del DESIGN_SYSTEM.md.

---

**Componentes especificos a crear:**

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| `HeroSection` | `src/app/_components/landing/HeroSection.tsx` | Hero full-viewport con geometria decorativa, CTAs |
| `ServicesSection` | `src/app/_components/landing/ServicesSection.tsx` | Grid de 6 servicios con glassmorphism cards |
| `StatsSection` | `src/app/_components/landing/StatsSection.tsx` | Indicadores de confianza con numeros |
| `FeaturesSection` | `src/app/_components/landing/FeaturesSection.tsx` | 3 diferenciadores con iconos |
| `CtaSection` | `src/app/_components/landing/CtaSection.tsx` | Call-to-action final antes del footer |
| `FooterSection` | `src/app/_components/landing/FooterSection.tsx` | Footer completo con copyright dinamico |
| `GeometricBackground` | `src/app/_components/landing/GeometricBackground.tsx` | SVG/pseudo-elementos con rombos, rayos, triangulos decorativos |

**Nota:** Todos los componentes deben usar exclusivamente los tokens del DESIGN_SYSTEM.md (variables CSS `hsl(var(--primary))`, clases de Tailwind mapeadas, etc.). No se permite CSS inline ni valores hardcodeados de color.

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