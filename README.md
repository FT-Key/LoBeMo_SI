<p align="center">
  <img src="public/lobemo-extended.png" alt="LoBeMo Seguridad Informática" width="400" />
</p>

<h3 align="center">Sistema de Gestión de Proyectos de Ciberseguridad</h3>

<p align="center">
  <a href="https://tu-app.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Deploy en Vercel" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7.8-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL Neon" />
  <img src="https://img.shields.io/badge/Cloudflare-R2-F48120?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare R2" />
</p>

<p align="center">
  Sistema web de gestión interna para LoBeMo Seguridad Informática. Administra proyectos de ciberseguridad, clientes, propuestas, recursos humanos y la trazabilidad completa del ciclo de vida de cada servicio.
</p>

---

## La Empresa

**LoBeMo Seguridad Informática** es una empresa tucumana especializada en ciberseguridad, ubicada en el Noroeste Argentino (NOA). Brinda soluciones integrales de protección de datos, sistemas y redes para organizaciones de la región.

### Misión

Brindar soluciones de seguridad informática personalizadas a empresas y organizaciones de la región, protegiéndolas frente a amenazas digitales con confiabilidad, innovación y compromiso.

### Visión

Ser la empresa de ciberseguridad de referencia en el NOA, reconocida por la calidad técnica de sus servicios y por contribuir activamente a la madurez digital de las organizaciones de la región.

### Servicios

| Servicio | Descripción |
|----------|-------------|
| **Auditoría ISO 27001** | Evaluación de cumplimiento normativo y estándares internacionales de seguridad |
| **Pentesting** | Pruebas de penetración para identificar vulnerabilidades antes de que sean explotadas |
| **Desarrollo Seguro** | Creación de software con altos estándares de seguridad integrada |
| **Consultoría en Redes** | Diseño e implementación de infraestructura de red segura |
| **Capacitación** | Programas de formación en ciberseguridad para equipos organizacionales |
| **Soporte Técnico** | Asistencia y resolución de incidentes de seguridad |

### Cobertura

- **Noroeste Argentino (NOA):** Tucumán, Salta, Jujuy, Catamarca, Santiago del Estero
- **Público objetivo:** PYMES de la provincia de Tucumán que manejen información sensible
- **Equipo:** 11 colaboradores distribuidos en 4 áreas + 2 reportes directos a Gerencia

---

## El Sistema

El sistema es una **web application single-tenant** diseñada para uso interno exclusivo de LoBeMo. Permite gestionar el ciclo de vida completo de cada proyecto de ciberseguridad, desde el relevamiento inicial hasta el cierre y entrega final.

### Módulos

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| **Autenticación** | `/login` | Login con email/contraseña, roles predefinidos, JWT |
| **Landing Page** | `/` | Página de inicio con identidad visual LoBeMo |
| **Dashboard Ejecutivo** | `/dashboard` | Indicadores: proyectos activos, empleados, ingresos, clientes nuevos |
| **Mi Dashboard** | `/mi-dashboard` | Dashboard personal del empleado: mis proyectos, tareas, actividad reciente |
| **Empleados** | `/empleados` | Gestión de los 11 colaboradores con roles y áreas predefinidas |
| **Clientes** | `/clientes` | Registro, edición y borrado lógico de organizaciones clientes |
| **Servicios** | `/servicios` | 6 tipos de servicio predefinidos (auditoría, pentesting, desarrollo, redes, capacitación, soporte) |
| **Proyectos** | `/proyectos` | Ciclo de vida completo: Relevamiento → Propuesta → Aprobado → En Ejecución ↔ En Revisión → Entregado → Cerrado |
| **Propuestas** | `/propuestas` | Cotizaciones con versionado, vencimiento automático y recotización |
| **Asignaciones** | (dentro de proyectos) | Asignación de empleados a proyectos con validación de carga máxima (3 proyectos activos) |
| **Tareas** | (dentro de proyectos) | Gestión de tareas por empleado con prioridades y estados |
| **Kanban** | `/kanban` | Tablero Kanban para visualizar tareas por estado |
| **Gantt** | `/gantt` | Diagrama de Gantt global de todos los proyectos |
| **Gantt por Proyecto** | `/proyectos/[id]/gantt` | Diagrama de Gantt individual por proyecto |
| **Hitos** | (dentro de proyectos) | Eventos programados con notificaciones automáticas |
| **Calendario** | `/calendario` | Vista integrada de hitos y vencimientos de propuestas |
| **Comentarios** | (dentro de proyectos/tareas) | Sistema de comentarios en proyectos y tareas |
| **Documentos** | (dentro de proyectos) | Adjuntos clasificados por tipo (informes, reportes, código, configuraciones, etc.) |
| **Notificaciones** | (badge global) | Alertas automáticas por asignaciones, cambios de estado y vencimientos |
| **Búsqueda Global** | `/search` | Búsqueda full-text entre proyectos, clientes, tareas y empleados |
| **Filtros Guardados** | (persistidos) | Guardar y reutilizar combinaciones de filtros |
| **Métricas por Proyecto** | `/proyectos/[id]/metricas` | Gráficos de avance, horas invertidas y tareas completadas |
| **Registro de Horas** | (dentro de proyectos) | Registro de horas invertidas por empleado en proyectos |
| **Auditoría (AuditLog)** | `/auditoria` | Registro inmutable de toda operación CRUD del sistema |
| **Capacitaciones** | `/capacitaciones` | Programas de formación, asistentes, evaluaciones y certificados digitales |
| **Pentesting** | `/pentesting` | Registro de hallazgos con severidad, evidencia y aprobación del CISO |
| **Informes de Auditoría** | `/informes-auditoria` | Generación de informes con hallazgos, no conformidades y recomendaciones |
| **Soporte Técnico** | `/soporte` | Tickets de asistencia vinculados a proyectos |
| **Exportación PDF** | (botones en módulos) | Exportación de informes (auditoría, pentesting, dashboard, proyectos, certificados) |
| **Seguimiento Público** | `/seguimiento` | Portal público para que clientes sigan el estado de sus proyectos |
| **Portal del Cliente** | (acceso con clave) | Acceso del cliente a documentos y estado de proyecto |
| **Solicitar Acceso** | `/solicitar-acceso` | Formulario para que nuevos empleados soliciten acceso al sistema |
| **Panel de Administración** | `/admin` | Configuración del sistema y manual de uso interno |

---

## Stack Tecnológico

### Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Next.js** | 16 (App Router) | Framework React full-stack |
| **React** | 19 | UI library |
| **TypeScript** | 5.x (strict mode) | Tipado estático |
| **Tailwind CSS** | 4.x | Utility-first CSS |
| **shadcn/ui** | — | Componentes UI pre-construidos |
| **TanStack Query** | 5.x | Estado del servidor y cache |
| **Framer Motion** | 12.x | Animaciones y transiciones de página |
| **Lucide Icons** | — | Iconografía |
| **Zod** | 4.x | Validación de esquemas |
| **React Hook Form** | 7.x | Gestión de formularios |
| **@dnd-kit** | — | Drag & drop (Kanban) |
| **React Leaflet** | 5.x | Mapas (seguimiento) |
| **React Markdown** | 10.x | Renderizado de markdown (manuales) |
| **next-themes** | — | Dark/Light theme toggle |

### Backend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Prisma** | 7.8 | ORM con type safety + Neon adapter |
| **PostgreSQL** (Neon) | — | Base de datos serverless |
| **Auth.js** | v5 (beta.31) | Autenticación con JWT + credentials provider |
| **bcryptjs** | 3.x | Hash de contraseñas |
| **jsonwebtoken** | 9.x | JWT para portal del cliente |
| **Nodemailer** | 7.x | Envío de emails (SMTP Gmail) |
| **Pino** | 10.x | Logging estructurado |
| **AWS SDK S3** | 3.x | Upload a Cloudflare R2 (compatible S3) |
| **ExcelJS** | 4.x | Exportación a Excel |

### DevOps & Herramientas

| Herramienta | Uso |
|-------------|-----|
| **Vercel** | Hosting y despliegue |
| **GitHub** | Control de versiones (repositorio privado) |
| **Neon** | PostgreSQL serverless |
| **Cloudflare R2** | Almacenamiento de documentos (compatible S3) |
| **ESLint** | Linting |
| **Vitest** | Unit testing + coverage |
| **TypeScript** | Type checking (`tsc --noEmit`) |
| **PostCSS** | Procesamiento de CSS |

---

## Arquitectura

El sistema sigue una **arquitectura hexagonal** (puertos y adaptadores) combinada con **Domain-Driven Design (DDD)**, garantizando separación estricta entre la lógica de negocio y la infraestructura.

```
┌──────────────────────────────────────────────────────┐
│                  CAPA DE PRESENTACIÓN                │
│              Next.js App Router + React               │
├──────────────────────────────────────────────────────┤
│                   CAPA DE APLICACIÓN                  │
│              API Routes + TanStack Query              │
├──────────────────────────────────────────────────────┤
│                     DOMINIO                           │
│              Entidades + Reglas de Negocio            │
│           (sin dependencias de infraestructura)       │
├──────────────────────────────────────────────────────┤
│                  CAPA DE INFRAESTRUCTURA              │
│     Prisma (DB) · Auth.js (Auth) · Vercel (Deploy)   │
└──────────────────────────────────────────────────────┘
```

**Principios de diseño:**
- Dominio desacoplado de infraestructura
- Validación compartida cliente-servidor (Zod)
- Type safety completo (TypeScript strict)
- Separación de capas por responsabilidad
- Principios SOLID, KISS, DRY, YAGNI

---

## Modelo de Dominio

### Entidades Principales

| Entidad | Descripción |
|---------|-------------|
| **Empleado** | Colaborador de LoBeMo con rol y área predefinidos |
| **Cliente** | Organización que contrata servicios |
| **Servicio** | Tipo de trabajo ofrecido (6 predefinidos) |
| **Proyecto** | Compromiso con un cliente para entregar servicios |
| **Propuesta** | Cotización formal con versionado |
| **Asignación** | Vínculo entre empleado y proyecto |
| **Tarea** | Actividad atómica asignable a un empleado |
| **Hito** | Evento programado dentro de un proyecto |
| **Documento** | Archivo adjunto a proyectos o tareas |
| **Notificación** | Alerta automática para un empleado |
| **AuditLog** | Registro inmutable de operaciones CRUD |

### Flujo de Estados del Proyecto

```
RELEVAMIENTO → PROPUESTA → APROBADO → EN_EJECUCION ↔ EN_REVISION → ENTREGADO → CERRADO
```

**Reglas de negocio clave:**
- Solo Gerente General o CISO pueden crear proyectos
- La propuesta debe estar ACEPTADA para pasar a APROBADO
- Máximo 3 proyectos activos por empleado
- Todas las tareas deben estar COMPLETADAS para marcar ENTREGADO
- CERRADO es un estado terminal (sin retorno)
- Toda operación CRUD se registra en AuditLog

---

## Estructura del Proyecto

```
LoBeMo_SI/
├── prisma/                  # Schema, migraciones y seed de Prisma
├── public/                  # Assets estáticos (logos, imágenes)
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Login (Auth.js credentials provider)
│   │   ├── api/             # API Routes (REST) — 60+ endpoints
│   │   ├── admin/           # Panel de administración + manual interno
│   │   ├── auditoria/       # AuditLog del sistema
│   │   ├── calendario/      # Calendario de hitos y vencimientos
│   │   ├── capacitaciones/  # Gestión de capacitaciones
│   │   ├── clientes/        # CRUD de clientes
│   │   ├── dashboard/       # Dashboard ejecutivo
│   │   ├── empleados/       # Gestión de empleados
│   │   ├── gantt/           # Diagrama de Gantt global
│   │   ├── informes-auditoria/ # Informes de auditoría
│   │   ├── kanban/          # Tablero Kanban de tareas
│   │   ├── mi-dashboard/    # Dashboard personal del empleado
│   │   ├── pentesting/      # Hallazgos de pentesting
│   │   ├── propuestas/      # Gestión de propuestas
│   │   ├── proyectos/       # Ciclo de vida de proyectos + métricas + Gantt
│   │   ├── seguimiento/     # Portal público de seguimiento para clientes
│   │   ├── servicios/       # Catálogo de servicios
│   │   ├── solicitar-acceso/ # Formulario de solicitud de acceso
│   │   └── soporte/         # Tickets de soporte técnico
│   ├── components/          # Componentes React reutilizables
│   │   ├── admin/           # Componentes del panel admin
│   │   ├── audit-log/       # Componentes del AuditLog
│   │   ├── calendario/      # Calendario
│   │   ├── capacitaciones/  # Capacitaciones
│   │   ├── comentarios/     # Sistema de comentarios
│   │   ├── dashboard/       # Dashboard ejecutivo
│   │   ├── exportar/        # Exportación PDF/Excel
│   │   ├── gantt/           # Diagrama de Gantt
│   │   ├── informes-auditoria/ # Informes de auditoría
│   │   ├── landing/         # Landing page
│   │   ├── metricas/        # Métricas por proyecto
│   │   ├── modals/          # Modales compartidos
│   │   ├── notificaciones/  # Sistema de notificaciones
│   │   ├── pentesting/      # Hallazgos de pentesting
│   │   ├── search/          # Búsqueda global
│   │   ├── soporte/         # Tickets de soporte
│   │   ├── tareas/          # Gestión de tareas
│   │   └── ui/              # Componentes base (shadcn/ui)
│   ├── content/
│   │   └── manuals/         # Manuales internos (Markdown)
│   ├── lib/                 # Utilidades compartidas
│   │   ├── prisma.ts        # Cliente Prisma (Neon adapter)
│   │   ├── auth-helpers.ts  # Helpers de autenticación
│   │   ├── email.ts         # Envío de emails (Nodemailer)
│   │   ├── email-templates/ # Templates HTML de emails
│   │   ├── logger.ts        # Logging estructurado (Pino)
│   │   ├── r2.ts            # Upload a Cloudflare R2
│   │   ├── utils.ts         # Funciones auxiliares
│   │   └── api-validate.ts  # Validación de API
│   ├── shared/
│   │   └── validation/      # Esquemas Zod (validación compartida)
│   └── types/               # Definiciones TypeScript
├── .opencode/               # Configuración del workflow multi-agente
│   ├── skills/              # Skills especializados
│   └── workflow/            # Estado del proyecto y requerimientos
├── baseProyecto/            # Documentación académica (TP1, TP2)
├── docs/                    # Documentación del proyecto
├── AGENTS.md                # Reglas del equipo multi-agente
├── opencode.json            # Configuración de agentes
├── prisma.config.ts         # Configuración de Prisma
├── next.config.ts           # Configuración de Next.js
├── tsconfig.json            # Configuración de TypeScript
├── eslint.config.mjs        # Configuración de ESLint
├── postcss.config.mjs       # Configuración de PostCSS
└── components.json          # Configuración de shadcn/ui
```

---

## Getting Started

### Prerequisitos

- **Node.js** 18.17 o superior
- **npm** (o yarn/pnpm)
- Cuenta en [Vercel](https://vercel.com) (para deploy)
- Cuenta en [Neon](https://neon.tech) (para PostgreSQL serverless)

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto (ver `.env.example`):

```env
# ─── Base de datos (Neon PostgreSQL) ───
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/lobemo?sslmode=require"

# ─── Auth (NextAuth v5) ───
AUTH_SECRET=""
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

# ─── Email — Formulario de contacto (Gmail SMTP) ───
CONTACT_EMAIL="destino@lobemo.com"
SMTP_USER="tu-gmail@gmail.com"
SMTP_PASS="xxxx-xxxx-xxxx-xxxx"
SMTP_REDIRECT_TO="tu-email@ejemplo.com"

# ─── Cloudflare R2 (almacenamiento de documentos) ───
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="lobemo-docs"

# ─── Portal del cliente (JWT para acceso externo) ───
PORTAL_JWT_SECRET=""

# ─── Logging (opcional) ───
LOG_LEVEL="info"
```

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | Sí | Connection string de Neon PostgreSQL |
| `AUTH_SECRET` | Sí | Secreto para JWT de Auth.js (generar con `openssl rand -base64 32`) |
| `AUTH_URL` | Sí | URL base de la app |
| `NEXTAUTH_URL` | Sí | URL para portal de cliente y redireccionamientos |
| `SMTP_USER` | Sí | Usuario Gmail para envío de emails |
| `SMTP_PASS` | Sí | Contraseña de aplicación Gmail |
| `CONTACT_EMAIL` | Sí | Email destino del formulario de contacto |
| `SMTP_REDIRECT_TO` | No | Redirigir todos los emails a este email (útil en desarrollo) |
| `R2_ACCOUNT_ID` | Para docs | ID de cuenta Cloudflare R2 |
| `R2_ACCESS_KEY_ID` | Para docs | Access key de R2 |
| `R2_SECRET_ACCESS_KEY` | Para docs | Secret key de R2 |
| `R2_BUCKET_NAME` | Para docs | Nombre del bucket R2 (default: `lobemo-docs`) |
| `PORTAL_JWT_SECRET` | No | Secreto JWT para portal del cliente |
| `LOG_LEVEL` | No | Nivel de log: `debug`, `info`, `warn`, `error` (default: `info`) |

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/FT-Key/LoBeMo_SI.git
cd LoBeMo_SI

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Sincronizar schema con la base de datos
npx prisma db push

# 5. Generar cliente Prisma
npx prisma generate

# 6. Iniciar en desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción (`prisma generate && next build`) |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | Ejecutar ESLint |
| `npm run typecheck` | Verificar tipos TypeScript (`tsc --noEmit`) |
| `npm run test` | Ejecutar tests en modo watch (Vitest) |
| `npm run test:run` | Ejecutar todos los tests una vez |
| `npm run test:coverage` | Ejecutar tests con reporte de cobertura |
| `npm run db:seed` | Cargar datos demo ("Centro Hogar") |
| `npm run db:reset` | Resetear BD + seed completo |

---

## Deploy

### Vercel (Producción)

1. Conectar el repositorio de GitHub a Vercel
2. Configurar variables de entorno en el dashboard de Vercel
3. El deploy se ejecuta automáticamente en cada push a `main`/`dev`

**Build command:** `prisma generate && next build`

### Base de Datos (Neon)

1. Crear un proyecto en [Neon](https://neon.tech)
2. Copiar la connection string a `DATABASE_URL`
3. Ejecutar `npx prisma db push` para sincronizar el schema

---

## Flujo de Desarrollo (Multi-Agente)

Este proyecto utiliza un workflow multi-agente con **Quality Gate Loop**:

```
SETUP → PLAN → IMPLEMENT → QUALITY GATES (loop) → FINALIZE → GIT+PR → DONE
```

Los quality gates (code review, tests, lint, design) se ejecutan en paralelo. Si alguno falla, se vuelve a implementar hasta que todos pasen.

**64 User Stories completadas** desde US-001 hasta US-064. Documentación del workflow en `AGENTS.md`.

---

## Licencia

Este es un proyecto **privado** de LoBeMo Seguridad Informática. No está autorizada su redistribución sin consentimiento expreso de la empresa.

---

<p align="center">
  <strong>LoBeMo Seguridad Informática</strong> — Tucumán, Argentina<br>
  <sub>Ciberseguridad con confiabilidad, innovación y compromiso</sub>
</p>
