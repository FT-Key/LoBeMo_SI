<p align="center">
  <img src="public/lobemo-extended.png" alt="LoBeMo Seguridad Informática" width="400" />
</p>

<h3 align="center">Sistema de Gestión de Proyectos de Ciberseguridad</h3>

<p align="center">
  <a href="https://tu-app.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Deploy en Vercel" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-5.31-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7.8-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL Neon" />
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

| Módulo | Descripción |
|--------|-------------|
| **Autenticación** | Login con email/contraseña, roles predefinidos, registro inicial del Gerente General como superadmin |
| **Empleados** | Gestión de los 11 colaboradores con roles y áreas predefinidas |
| **Clientes** | Registro, edición y borrado lógico de organizaciones clientes |
| **Servicios** | 6 tipos de servicio predefinidos (auditoría, pentesting, desarrollo, redes, capacitación, soporte) |
| **Proyectos** | Ciclo de vida completo: Relevamiento → Propuesta → Aprobado → En Ejecución ↔ En Revisión → Entregado → Cerrado |
| **Propuestas** | Cotizaciones con versionado, vencimiento automático y recotización |
| **Asignaciones** | Asignación de empleados a proyectos con validación de carga máxima (3 proyectos activos) |
| **Tareas** | Gestión de tareas por empleado con prioridades y estados |
| **Hitos** | Eventos programados con notificaciones automáticas |
| **Dashboard** | Indicadores ejecutivos: proyectos activos, empleados, ingresos, clientes nuevos |
| **Documentos** | Adjuntos clasificados por tipo (informes, reportes, código, configuraciones, etc.) |
| **Notificaciones** | Alertas automáticas por asignaciones, cambios de estado y vencimientos |
| **Auditoría (AuditLog)** | Registro inmutable de toda operación CRUD del sistema |
| **Capacitaciones** | Programas de formación, asistentes, evaluaciones y certificados digitales |
| **Pentesting** | Registro de hallazgos con severidad, evidencia y aprobación del CISO |
| **Informes de Auditoría** | Generación de informes con hallazgos, no conformidades y recomendaciones |
| **Soporte Técnico** | Tickets de asistencia vinculados a proyectos |
| **Calendario** | Vista integrada de hitos y vencimientos |
| **Exportación PDF** | Generación de informes en formato profesional |

---

## Stack Tecnológico

### Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Next.js** | 15 (App Router) | Framework React full-stack |
| **React** | 19 | UI library |
| **TypeScript** | 5.x (strict mode) | Tipado estático |
| **Tailwind CSS** | 4.x | Utility-first CSS |
| **shadcn/ui** | — | Componentes UI pre-construidos |
| **TanStack Query** | 5.x | Estado del servidor y cache |
| **Framer Motion** | 12.x | Animaciones |
| **Lucide Icons** | — | Iconografía |
| **Zod** | 4.x | Validación de esquemas |
| **React Hook Form** | 7.x | Gestión de formularios |

### Backend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Prisma** | 7.8 | ORM con type safety |
| **PostgreSQL** (Neon) | — | Base de datos serverless |
| **Auth.js** | v5 (beta) | Autenticación con JWT |
| **bcryptjs** | 3.x | Hash de contraseñas |

### DevOps & Herramientas

| Herramienta | Uso |
|-------------|-----|
| **Vercel** | Hosting y despliegue |
| **GitHub** | Control de versiones (repositorio privado) |
| **Neon** | PostgreSQL serverless |
| **ESLint** | Linting |
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
├── prisma/                  # Schema y migraciones de Prisma
├── public/                  # Assets estáticos (logos, imágenes)
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Login y registro (Auth.js)
│   │   ├── api/             # API Routes (REST)
│   │   ├── admin/           # Panel de administración
│   │   ├── auditoria/       # AuditLog del sistema
│   │   ├── calendario/      # Calendario de hitos
│   │   ├── capacitaciones/  # Gestión de capacitaciones
│   │   ├── clientes/        # CRUD de clientes
│   │   ├── dashboard/       # Dashboard ejecutivo
│   │   ├── empleados/       # Gestión de empleados
│   │   ├── informes-auditoria/ # Informes de auditoría
│   │   ├── pentesting/      # Hallazgos de pentesting
│   │   ├── propuestas/      # Gestión de propuestas
│   │   ├── proyectos/       # Ciclo de vida de proyectos
│   │   ├── servicios/       # Catálogo de servicios
│   │   └── soporte/         # Tickets de soporte
│   ├── components/          # Componentes React reutilizables
│   │   ├── landing/         # Componentes de la landing page
│   │   ├── ui/              # Componentes base (shadcn/ui)
│   │   └── [módulo]/        # Componentes específicos por módulo
│   ├── lib/                 # Utilidades compartidas
│   │   ├── prisma.ts        # Cliente Prisma
│   │   ├── utils.ts         # Funciones auxiliares
│   │   └── api-validate.ts  # Validación de API
│   ├── shared/
│   │   └── validation/      # Esquemas Zod (validación compartida)
│   └── types/               # Definiciones TypeScript
├── .opencode/               # Configuración del workflow multi-agente
│   ├── skills/              # Skills especializados
│   └── workflow/            # Estado del proyecto y requerimientos
├── baseProyecto/            # Documentación académica (TP1, TP2)
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

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-aqui-generar-con-openssl-rand-base64-32"
```

> **Nota:** `NEXTAUTH_SECRET` se genera con: `openssl rand -base64 32`

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
| `npm run build` | Build de producción (prisma generate + next build) |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | Ejecutar ESLint |
| `npm run typecheck` | Verificar tipos TypeScript |

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

Documentación del workflow en `AGENTS.md`.

---

## Licencia

Este es un proyecto **privado** de LoBeMo Seguridad Informática. No está autorizada su redistribución sin consentimiento expreso de la empresa.

---

<p align="center">
  <strong>LoBeMo Seguridad Informática</strong> — Tucumán, Argentina<br>
  <sub>Ciberseguridad con confiabilidad, innovación y compromiso</sub>
</p>
