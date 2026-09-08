import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import type { HTTPQueryOptions } from "@neondatabase/serverless";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { config } from "dotenv";
import { generarCodigoProyecto } from "../src/lib/proyecto-codigo";

config({ path: ".env.local" });

function createClient() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL no definida");
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL, {} as HTTPQueryOptions<boolean, boolean>);
  return new PrismaClient({ adapter });
}

const prisma = createClient();

// ============================================================
// Helpers
// ============================================================

function id(): string {
  return randomUUID();
}

function date(daysFromNow: number): Date {
  const d = new Date("2026-06-01T09:00:00Z");
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

function log(msg: string) {
  console.log(`  ✓ ${msg}`);
}

// ============================================================
// Data
// ============================================================

const EMPLEADOS = [
  { id: id(), nombre: "Super", apellido: "Admin", email: "superadmin@lobemo.com", rol: "GERENTE_GENERAL", area: "GERENCIA" },
  { id: id(), nombre: "Franco Nicolás", apellido: "Toledo", email: "fr4nc0t2@gmail.com", rol: "DESARROLLADOR", area: "SISTEMAS" },
  { id: id(), nombre: "Mario", apellido: "Villarreal", email: "mariovillarreal.isj@gmail.com", rol: "CISO", area: "SISTEMAS" },
  { id: id(), nombre: "Juan", apellido: "Robles", email: "roblesreinosojuan@gmail.com", rol: "DESARROLLADOR", area: "SISTEMAS" },
  { id: id(), nombre: "Julián", apellido: "Molicia", email: "julimolicia7@gmail.com", rol: "ANALISTA_SEGURIDAD", area: "SISTEMAS" },
  { id: id(), nombre: "Sebastián", apellido: "Zelarayan", email: "sebazela@gmail.com", rol: "AUDITOR", area: "AUDITORIA" },
  { id: id(), nombre: "Valentina", apellido: "Rojas", email: "valentina.rojas@lobemo.com", rol: "CAPACITADOR", area: "CAPACITACION" },
  { id: id(), nombre: "Diego", apellido: "Ramirez", email: "diego.ramirez@lobemo.com", rol: "ESPECIALISTA_REDES", area: "SISTEMAS" },
  { id: id(), nombre: "Laura", apellido: "Mendez", email: "laura.mendez@lobemo.com", rol: "SOPORTE_TECNICO", area: "SISTEMAS" },
  { id: id(), nombre: "Carlos", apellido: "Peralta", email: "carlos.peralta@lobemo.com", rol: "ADMINISTRACION", area: "ADMINISTRACION" },
  { id: id(), nombre: "Lucía", apellido: "Fernández", email: "lucia.fernandez@lobemo.com", rol: "VENTAS", area: "COMERCIAL" },
];

const SERVICIOS = [
  { id: id(), nombre: "Auditoría ISO 27001", descripcion: "Evaluación de cumplimiento ISO 27001: auditoría sistemática de controles de seguridad de la información.", precioBase: 850000 },
  { id: id(), nombre: "Pentesting", descripcion: "Pruebas de penetración controladas para identificar vulnerabilidades explotables en sistemas, redes y aplicaciones.", precioBase: 1200000 },
  { id: id(), nombre: "Desarrollo Seguro", descripcion: "Revisión de código y diseño de aplicaciones con enfoque en seguridad: OWASP, secure coding.", precioBase: 950000 },
  { id: id(), nombre: "Consultoría en Redes", descripcion: "Diagnóstico y optimización de infraestructura de redes corporativas seguras.", precioBase: 650000 },
  { id: id(), nombre: "Capacitación", descripcion: "Formación teórico-práctica en ciberseguridad para equipos técnicos y no técnicos.", precioBase: 400000 },
  { id: id(), nombre: "Soporte Técnico", descripcion: "Soporte técnico especializado en seguridad informática: atención de incidentes y mantenimiento.", precioBase: 350000 },
];

const CLIENTE_ID = id();

const PROYECTO_ID = id();

const ASIGNACIONES = [
  { id: id(), empleadoIdx: 2, rol: "Líder del Proyecto" },       // Mario Villarreal (CISO)
  { id: id(), empleadoIdx: 1, rol: "Desarrollador Seguro" },      // Franco Toledo
  { id: id(), empleadoIdx: 4, rol: "Analista de Vulnerabilidades" }, // Julián Molicia
  { id: id(), empleadoIdx: 5, rol: "Auditor Principal" },         // Sebastián Zelarayan
  { id: id(), empleadoIdx: 3, rol: "Pentester" },                 // Juan Robles
  { id: id(), empleadoIdx: 7, rol: "Especialista de Redes" },     // Diego Ramirez
  { id: id(), empleadoIdx: 6, rol: "Capacitadora" },              // Valentina Rojas
  { id: id(), empleadoIdx: 8, rol: "Soporte Post-Entrega" },      // Laura Mendez
];

const TAREAS = [
  // Fase 1: Auditoría (días 0-20)
  { id: id(), titulo: "Revisar arquitectura y controles de acceso", estado: "COMPLETADA", prioridad: "ALTA", fase: "auditoria", createdAt: date(-2), fechaLimite: date(5) },
  { id: id(), titulo: "Evaluar políticas de contraseñas y autenticación", estado: "COMPLETADA", prioridad: "ALTA", fase: "auditoria", createdAt: date(-1), fechaLimite: date(8) },
  { id: id(), titulo: "Analizar configuración JWT", estado: "COMPLETADA", prioridad: "MEDIA", fase: "auditoria", createdAt: date(1), fechaLimite: date(12) },
  { id: id(), titulo: "Revisar sistema de logs y auditoría", estado: "COMPLETADA", prioridad: "ALTA", fase: "auditoria", createdAt: date(2), fechaLimite: date(15) },
  { id: id(), titulo: "Generar informe de auditoría", estado: "COMPLETADA", prioridad: "CRITICA", fase: "auditoria", createdAt: date(10), fechaLimite: date(20) },
  // Fase 2: Pentesting (días 15-40)
  { id: id(), titulo: "Identificar vectores OWASP Top 10", estado: "COMPLETADA", prioridad: "ALTA", fase: "pentesting", createdAt: date(15), fechaLimite: date(22) },
  { id: id(), titulo: "Evaluar endpoints de autenticación", estado: "COMPLETADA", prioridad: "ALTA", fase: "pentesting", createdAt: date(18), fechaLimite: date(28) },
  { id: id(), titulo: "Probar inyección SQL y XSS", estado: "COMPLETADA", prioridad: "CRITICA", fase: "pentesting", createdAt: date(22), fechaLimite: date(35) },
  { id: id(), titulo: "Generar reporte de hallazgos", estado: "COMPLETADA", prioridad: "ALTA", fase: "pentesting", createdAt: date(30), fechaLimite: date(40) },
  // Fase 3: Desarrollo Seguro (días 35-55)
  { id: id(), titulo: "Revisar código fuente del backend", estado: "COMPLETADA", prioridad: "ALTA", fase: "desarrollo", createdAt: date(35), fechaLimite: date(42) },
  { id: id(), titulo: "Evaluar validación de inputs (Zod)", estado: "COMPLETADA", prioridad: "MEDIA", fase: "desarrollo", createdAt: date(38), fechaLimite: date(48) },
  { id: id(), titulo: "Documentar vulnerabilidades de código", estado: "COMPLETADA", prioridad: "ALTA", fase: "desarrollo", createdAt: date(42), fechaLimite: date(55) },
  // Fase 4: Hardening Redes (días 50-70)
  { id: id(), titulo: "Evaluar configuración vs CIS Benchmarks", estado: "COMPLETADA", prioridad: "ALTA", fase: "hardening", createdAt: date(50), fechaLimite: date(58) },
  { id: id(), titulo: "Revisar configuración de MySQL", estado: "COMPLETADA", prioridad: "MEDIA", fase: "hardening", createdAt: date(53), fechaLimite: date(62) },
  { id: id(), titulo: "Documentar recomendaciones de hardening", estado: "COMPLETADA", prioridad: "MEDIA", fase: "hardening", createdAt: date(58), fechaLimite: date(70) },
  // Fase 5: Capacitación (días 65-82)
  { id: id(), titulo: "Diseñar temario de capacitación", estado: "COMPLETADA", prioridad: "MEDIA", fase: "capacitacion", createdAt: date(65), fechaLimite: date(72) },
  { id: id(), titulo: "Capacitar equipo de Centro Hogar", estado: "COMPLETADA", prioridad: "ALTA", fase: "capacitacion", createdAt: date(70), fechaLimite: date(78) },
  { id: id(), titulo: "Evaluar resultados y generar certificados", estado: "COMPLETADA", prioridad: "MEDIA", fase: "capacitacion", createdAt: date(75), fechaLimite: date(82) },
  // Fase 6: Consultoría (días 78-92)
  { id: id(), titulo: "Analizar cumplimiento Ley 25.326", estado: "COMPLETADA", prioridad: "ALTA", fase: "consultoria", createdAt: date(78), fechaLimite: date(84) },
  { id: id(), titulo: "Definir roadmap de compliance", estado: "COMPLETADA", prioridad: "MEDIA", fase: "consultoria", createdAt: date(82), fechaLimite: date(88) },
  { id: id(), titulo: "Generar informe final con recomendaciones", estado: "COMPLETADA", prioridad: "CRITICA", fase: "consultoria", createdAt: date(86), fechaLimite: date(92) },
];

const HALLAZGOS = [
  { id: id(), titulo: "Conexión a MySQL con usuario root", descripcion: "El backend se conecta a MySQL usando el usuario root (DB_USER=root). Esto otorga privilegios máximos innecesarios y viola el principio de menor privilegio.", severidad: "ALTA", recomendacion: "Crear un usuario de base de datos con permisos mínimos necesarios (SELECT, INSERT, UPDATE, DELETE solo sobre las tablas requeridas). Revocar acceso root para conexiones remotas." },
  { id: id(), titulo: "Auditoría limitada a movimientos de stock", descripcion: "Solo existe una tabla de auditoría para movimientos de stock. No hay registro de accesos, cambios de datos sensibles ni actividad de administradores.", severidad: "ALTA", recomendacion: "Implementar una tabla general de audit_logs que registre CREATE, UPDATE, DELETE sobre todas las entidades sensibles (usuarios, ventas, clientes)." },
  { id: id(), titulo: "JWT sin mecanismo de revocación server-side", descripcion: "Los tokens JWT no tienen mecanismo de invalidación del lado del servidor. Un token robado sigue siendo válido hasta su expiración.", severidad: "MEDIA", recomendacion: "Implementar una lista negra de tokens (token blacklist) en Redis o base de datos, o usar refresh tokens con rotación." },
  { id: id(), titulo: "Sin HTTPS/TLS configurado en producción", descripcion: "No se evidencia configuración de HTTPS/TLS para el entorno de producción. El tráfico viaja en texto plano.", severidad: "ALTA", recomendacion: "Configurar TLS 1.2+ con certificado Let's Encrypt. Forzar redirect HTTP → HTTPS. Habilitar HSTS." },
  { id: id(), titulo: "Política de contraseñas débil", descripcion: "La política solo requiere longitud mínima. No se exige complejidad ni se verifica contra contraseñas filtradas (NIST SP 800-63B).", severidad: "MEDIA", recomendacion: "Implementar validación de complejidad (mayúscula, minúscula, número, símbolo) y verificar contra listas de contraseñas comprometidas." },
  { id: id(), titulo: "Sin autenticación de dos factores (2FA)", descripcion: "No se ofrece 2FA como capa adicional de seguridad para autenticación.", severidad: "MEDIA", recomendacion: "Implementar 2FA via TOTP (Google Authenticator) como opción para todos los usuarios, obligatorio para administradores." },
  { id: id(), titulo: "Sin escaneo periódico de dependencias", descripcion: "No hay configuración de npm audit, Dependabot o Snyk para detectar vulnerabilidades en dependencias.", severidad: "MEDIA", recomendacion: "Configurar Dependabot en GitHub o Snyk. Ejecutar npm audit periódicamente. Agregar al pipeline de CI/CD." },
  { id: id(), titulo: "Sin política de privacidad de datos personales", descripcion: "No existe política de privacidad ni documentación de manejo de datos personales. Incumplimiento de Ley 25.326.", severidad: "ALTA", recomendacion: "Redactar política de privacidad según Ley 25.326. Documentar datos recopilados, finalidad, storage y derechos del titular." },
  { id: id(), titulo: "Sin rate limiting en endpoints de backup/export", descripcion: "Los endpoints de exportación y backup no tienen límite de tasa, lo que podría permitir denegación de servicio.", severidad: "BAJA", recomendacion: "Aplicar rate limiting específico a endpoints de exportación (máx 10 requests/minuto por usuario)." },
  { id: id(), titulo: "Capacitación puramente funcional sin contenido de seguridad", descripcion: "El entrenamiento del equipo solo cubre uso funcional del sistema. No hay módulos de concientización en seguridad.", severidad: "MEDIA", recomendacion: "Diseñar módulos de capacitación en seguridad: phishing, contraseñas seguras, manejo de datos sensibles, reporting de incidentes." },
];

const CAPACITACIONES = [
  { id: id(), titulo: "Seguridad en Desarrollo Web", temario: "OWASP Top 10, validación de inputs, autenticación segura, manejo de sesiones, seguridad en APIs REST, secure coding practices.", duracionHoras: 8, modalidad: "VIRTUAL", estado: "COMPLETADA" },
  { id: id(), titulo: "Manejo de Datos Personales (Ley 25.326)", temario: "Marco legal de protección de datos, derechos del titular, consentimiento, registro de operaciones, notificación de incidentes.", duracionHoras: 4, modalidad: "PRESENCIAL", estado: "COMPLETADA" },
];

const ASISTENTES = [
  { nombre: "Alexis Juarez", email: "juarez.centrohogar@gmail.com", evaluacion: 9, completado: true },
  { nombre: "Juan Marquez", email: "marquez.centrohogar@gmail.com", evaluacion: 8, completado: true },
  { nombre: "Maria Villarreal", email: "villarreal.centrohogar@gmail.com", evaluacion: 10, completado: true },
];

// ── Segundo cliente + proyecto activo (para US-054) ──

const CLIENTE_2_ID = id();

const PROYECTO_ACTIVO_ID = id();

const ASIGNACIONES_ACTIVAS = [
  { id: id(), empleadoIdx: 10, rol: "Ejecutivo de Ventas" },  // Lucía Fernández (VENTAS)
  { id: id(), empleadoIdx: 2, rol: "Líder Técnico" },         // Mario Villarreal (CISO)
];

const TAREAS_ACTIVAS = [
  { id: id(), titulo: "Relevamiento inicial de requerimientos", estado: "COMPLETADA", prioridad: "ALTA", createdAt: date(-5), fechaLimite: date(5) },
  { id: id(), titulo: "Diseño de propuesta técnica", estado: "EN_PROGRESO", prioridad: "ALTA", createdAt: date(-2), fechaLimite: date(10) },
  { id: id(), titulo: "Presentación de propuesta al cliente", estado: "PENDIENTE", prioridad: "MEDIA", createdAt: date(0), fechaLimite: date(15) },
];

const COMENTARIOS_SEED = [
  { contenido: "El relevamiento se completó exitosamente. El cliente necesita soporte 24/7.", tareaIdx: 0, autorIdx: 10 },
  { contenido: "Estoy diseñando la propuesta técnica. Revisaré los requisitos de SLA con el equipo.", tareaIdx: 1, autorIdx: 2 },
  { contenido: "Agendar reunión con el cliente para el viernes para presentar la propuesta.", tareaIdx: 2, autorIdx: 10 },
];

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("🗑️  Limpiando base de datos...");

  const PASSWORD_HASH = await hash("password123", 12);
  const PORTAL_CLAVE_HASH = await hash("centrohogar2026", 12);

  // Delete in reverse FK order
  await prisma.sesionPortal.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.configuracion.deleteMany();
  await prisma.ticketSoporte.deleteMany();
  await prisma.notificacion.deleteMany();
  await prisma.certificadoCapacitacion.deleteMany();
  await prisma.asistenteCapacitacion.deleteMany();
  await prisma.capacitacion.deleteMany();
  await prisma.hallazgoPentesting.deleteMany();
  await prisma.informeAuditoria.deleteMany();
  await prisma.documento.deleteMany();
  await prisma.hito.deleteMany();
  await prisma.comentario.deleteMany();
  await prisma.tarea.deleteMany();
  await prisma.asignacion.deleteMany();
  await prisma.propuesta.deleteMany();
  await prisma.historialEstado.deleteMany();
  await prisma.proyecto.deleteMany();
  await prisma.servicio.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.empleado.deleteMany();

  console.log("✅ Base de datos limpia\n");

  // ── Empleados ──
  console.log("👤 Creando empleados...");
  for (const emp of EMPLEADOS) {
    await prisma.empleado.create({
      data: {
        id: emp.id,
        nombre: emp.nombre,
        apellido: emp.apellido,
        email: emp.email,
        password: PASSWORD_HASH,
        rol: emp.rol as any,
        area: emp.area as any,
        activo: true,
      },
    });
    log(`${emp.nombre} ${emp.apellido} (${emp.rol})`);
  }

  // ── Cliente ──
  console.log("\n🏢 Creando cliente...");
  await prisma.cliente.create({
    data: {
      id: CLIENTE_ID,
      razonSocial: "Muebleria Centro Hogar S.R.L.",
      cuit: "30-71234567-9",
      emailContacto: "info@centrohogar.com",
      telefono: "+54 381 456-7890",
      direccion: "Av. Belgrano 1234, Bella Vista, Tucumán",
      sector: "Comercio / Retail",
      activo: true,
    },
  });
  log("Muebleria Centro Hogar S.R.L.");

  // ── Servicios ──
  console.log("\n📦 Creando servicios...");
  for (const serv of SERVICIOS) {
    await prisma.servicio.create({
      data: {
        id: serv.id,
        nombre: serv.nombre,
        descripcion: serv.descripcion,
        precioBase: serv.precioBase,
      },
    });
    log(`${serv.nombre} — $${serv.precioBase.toLocaleString("es-AR")}`);
  }

  // ── Proyecto ──
  console.log("\n📁 Creando proyecto...");
  const proyectoServicio = SERVICIOS[0]; // Auditoría ISO 27001 como servicio principal
  const codigoProyecto = await generarCodigoProyecto("Centro Hogar - Seguridad Informática Integral");
  await prisma.proyecto.create({
    data: {
      id: PROYECTO_ID,
      codigo: codigoProyecto,
      nombre: "Centro Hogar - Seguridad Informática Integral",
      descripcion: "Evaluación y hardening completo del sistema de gestión de ventas de Muebleria Centro Hogar. Incluye auditoría, pentesting, desarrollo seguro, hardening de redes, capacitación y consultoría estratégica.",
      estado: "CERRADO",
      fechaInicio: date(0),
      fechaEstimadaFin: date(92),
      fechaEntregaReal: date(92),
      montoAcordado: 4400000,
      clienteId: CLIENTE_ID,
      servicioId: proyectoServicio.id,
      portalActivo: true,
      portalClave: PORTAL_CLAVE_HASH,
    },
  });
  log("Centro Hogar - Seguridad Informática Integral (CERRADO)");
  log(`Portal: activo | Clave: centrohogar2026 | Código: ${codigoProyecto}`);

  // ── Historial de estados ──
  console.log("\n📋 Creando historial de estados...");
  const estados = [
    { anterior: null, nuevo: "RELEVAMIENTO", dia: 0 },
    { anterior: "RELEVAMIENTO", nuevo: "PROPUESTA", dia: 5 },
    { anterior: "PROPUESTA", nuevo: "APROBADO", dia: 12 },
    { anterior: "APROBADO", nuevo: "EN_EJECUCION", dia: 15 },
    { anterior: "EN_EJECUCION", nuevo: "EN_REVISION", dia: 75 },
    { anterior: "EN_REVISION", nuevo: "ENTREGADO", dia: 85 },
    { anterior: "ENTREGADO", nuevo: "CERRADO", dia: 92 },
  ];
  for (const e of estados) {
    await prisma.historialEstado.create({
      data: {
        id: id(),
        proyectoId: PROYECTO_ID,
        estadoAnterior: e.anterior,
        estadoNuevo: e.nuevo,
        empleadoId: EMPLEADOS[0].id,
        createdAt: date(e.dia),
      },
    });
    log(`${e.anterior ?? "—"} → ${e.nuevo}`);
  }

  // ── Propuesta ──
  console.log("\n📄 Creando propuesta...");
  await prisma.propuesta.create({
    data: {
      id: id(),
      version: 1,
      montoTotal: 4400000,
      detalleServicios: SERVICIOS.map((s) => ({
        servicio: s.nombre,
        monto: s.precioBase,
        descripcion: s.descripcion,
      })),
      fechaEmision: date(5),
      fechaVencimiento: date(25),
      estado: "ACEPTADA",
      proyectoId: PROYECTO_ID,
    },
  });
  log("Propuesta v1 — ACEPTADA — $4.400.000");

  // ── Asignaciones ──
  console.log("\n👥 Creando asignaciones...");
  for (const asig of ASIGNACIONES) {
    await prisma.asignacion.create({
      data: {
        id: asig.id,
        rolEnProyecto: asig.rol,
        proyectoId: PROYECTO_ID,
        empleadoId: EMPLEADOS[asig.empleadoIdx].id,
      },
    });
    log(`${EMPLEADOS[asig.empleadoIdx].nombre} ${EMPLEADOS[asig.empleadoIdx].apellido} — ${asig.rol}`);
  }

  // ── Tareas ──
  console.log("\n✅ Creando tareas...");
  const faseAsignacion: Record<string, number> = {
    auditoria: 3,    // Sebastián Zelarayan (idx 5)
    pentesting: 4,   // Juan Robles (idx 3)
    desarrollo: 1,   // Franco Toledo (idx 1)
    hardening: 6,    // Diego Ramirez (idx 7)
    capacitacion: 5, // Valentina Rojas (idx 6)
    consultoria: 0,  // Mario Villarreal (CISO, idx 2)
  };
  for (const tarea of TAREAS) {
    const asigIdx = faseAsignacion[tarea.fase] ?? 0;
    await prisma.tarea.create({
      data: {
        id: tarea.id,
        titulo: tarea.titulo,
        estado: tarea.estado,
        prioridad: tarea.prioridad,
        proyectoId: PROYECTO_ID,
        asignacionId: ASIGNACIONES[asigIdx].id,
        createdAt: tarea.createdAt,
        fechaLimite: tarea.fechaLimite,
      },
    });
    log(`[${tarea.fase}] ${tarea.titulo}`);
  }

  // ── Hitos ──
  console.log("\n🏁 Creando hitos...");
  const hitos = [
    { nombre: "Inicio del proyecto", dia: 0, completado: true },
    { nombre: "Informe de auditoría entregado", dia: 20, completado: true },
    { nombre: "Reporte de pentesting entregado", dia: 40, completado: true },
    { nombre: "Informe de desarrollo seguro", dia: 55, completado: true },
    { nombre: "Hardening completado", dia: 70, completado: true },
    { nombre: "Capacitación completada", dia: 80, completado: true },
    { nombre: "Cierre del proyecto", dia: 92, completado: true },
  ];
  for (const h of hitos) {
    await prisma.hito.create({
      data: {
        id: id(),
        nombre: h.nombre,
        fechaPrevista: date(h.dia),
        fechaReal: h.completado ? date(h.dia) : null,
        completado: h.completado,
        proyectoId: PROYECTO_ID,
      },
    });
    log(`${h.nombre} — ${date(h.dia).toLocaleDateString("es-AR")}`);
  }

  // ── Informe de Auditoría ──
  console.log("\n📊 Creando informe de auditoría...");
  await prisma.informeAuditoria.create({
    data: {
      id: id(),
      proyectoId: PROYECTO_ID,
      creadorId: EMPLEADOS[5].id, // Sebastián Zelarayan
      alcance: "Evaluación integral de seguridad del sistema de gestión de ventas de Centro Hogar. Análisis documental y de código fuente basado en OWASP ASVS, OWASP Top 10 (2021) y CIS Benchmarks.",
      criteriosAuditoria: "ISO/IEC 27001, OWASP ASVS v4.0, OWASP Top 10 (2021), OWASP Testing Guide, CIS Benchmarks for Node.js/Express y MySQL, NIST SP 800-86, Ley 25.326 de Protección de Datos Personales.",
      hallazgos: HALLAZGOS.map((h) => ({
        id: h.id,
        titulo: h.titulo,
        severidad: h.severidad,
        descripcion: h.descripcion,
      })),
      noConformidades: [
        "H1: Uso de usuario root en base de datos — incumple principio de menor privilegio",
        "H4: Ausencia de HTTPS/TLS — incumple confidencialidad de datos en tránsito",
        "H8: Sin política de privacidad — incumple Ley 25.326",
      ],
      observaciones: [
        "El sistema utiliza JWT para autenticación, pero sin mecanismo de revocación",
        "La validación de inputs está implementada con Zod, lo cual es una buena práctica",
        "El hash de contraseñas usa bcrypt con cost factor 12, adecuado",
        "Se usa Helmet y CORS en Express, pero la configuración requiere revisión",
      ],
      recomendaciones: [
        "CRÍTICO: Crear usuario de BD con permisos mínimos y revocar root",
        "CRÍTICO: Habilitar HTTPS/TLS 1.2+ con certificado válido",
        "CRÍTICO: Redactar política de privacidad según Ley 25.326",
        "ALTO: Implementar audit logging general",
        "ALTO: Agregar revocación de JWT y evaluar 2FA",
        "MEDIO: Establecer política de contraseñas robusta (NIST SP 800-63B)",
        "MEDIO: Configurar escaneo periódico de dependencias",
        "MEDIO: Implementar módulos de capacitación en seguridad",
        "BAJO: Agregar rate limiting a endpoints de exportación",
      ],
      estado: "APROBADO",
      fechaEmision: date(20),
    },
  });
  log("Informe de auditoría con 10 hallazgos (H1-H10)");

  // ── Hallazgos de Pentesting ──
  console.log("\n🔍 Creando hallazgos de pentesting...");
  for (const h of HALLAZGOS) {
    await prisma.hallazgoPentesting.create({
      data: {
        id: h.id,
        proyectoId: PROYECTO_ID,
        creadorId: EMPLEADOS[4].id, // Juan Robles (Pentester)
        titulo: h.titulo,
        descripcion: h.descripcion,
        severidad: h.severidad,
        evidencia: `Análisis documental y revisión de código fuente. Sin explotación activa (caja blanca sobre papel).`,
        recomendacion: h.recomendacion,
        estado: "CERRADO",
      },
    });
    log(`[${h.severidad}] ${h.titulo}`);
  }

  // ── Capacitaciones ──
  console.log("\n🎓 Creando capacitaciones...");
  const capacitacionIds: string[] = [];
  for (const cap of CAPACITACIONES) {
    const capId = cap.id;
    capacitacionIds.push(capId);
    await prisma.capacitacion.create({
      data: {
        id: capId,
        proyectoId: PROYECTO_ID,
        titulo: cap.titulo,
        temario: cap.temario,
        duracionHoras: cap.duracionHoras,
        modalidad: cap.modalidad,
        fechaInicio: date(60),
        fechaFin: date(65),
        estado: cap.estado,
        materiales: "Presentaciones PDF, ejercicios prácticos, cuestionario de evaluación",
      },
    });
    log(`${cap.titulo} (${cap.duracionHoras}h — ${cap.modalidad})`);
  }

  // ── Asistentes y Certificados ──
  console.log("\n📇 Creando asistentes y certificados...");
  for (let i = 0; i < ASISTENTES.length; i++) {
    const asist = ASISTENTES[i];
    let primerAsistenteCapId = "";
    for (let j = 0; j < capacitacionIds.length; j++) {
      const asistenteCapId = id();
      if (j === 0) primerAsistenteCapId = asistenteCapId;
      await prisma.asistenteCapacitacion.create({
        data: {
          id: asistenteCapId,
          capacitacionId: capacitacionIds[j],
          nombreAsistente: asist.nombre,
          emailAsistente: asist.email,
          organizacion: "Muebleria Centro Hogar",
          evaluacion: asist.evaluacion,
          completado: asist.completado,
        },
      });
    }
    if (asist.completado) {
      await prisma.certificadoCapacitacion.create({
        data: {
          id: id(),
          asistenteId: primerAsistenteCapId,
          codigoCertificado: `LOBEMO-${new Date().getFullYear()}-${String(i + 1).padStart(4, "0")}`,
        },
      });
    }
    log(`${asist.nombre} — Evaluación: ${asist.evaluacion}/10 — Certificado: ${asist.completado ? "Sí" : "No"}`);
  }

  // ── Tickets de soporte ──
  console.log("\n🎫 Creando tickets de soporte...");
  const tickets = [
    { titulo: "Consulta sobre configuración de CORS", descripcion: "El equipo de Centro Hogar solicita aclaración sobre la configuración de CORS en producción. Necesitan saber si los orígenes están restringidos correctamente.", prioridad: "MEDIA", estado: "CERRADO", categoria: "CONFIGURACION" },
    { titulo: "Solicitud de actualización de dependencias", descripcion: "Centro Hogar reporta que el reporte de npm audit muestra 3 vulnerabilidades en dependencias menores. Solicitan actualización.", prioridad: "ALTA", estado: "EN_PROGRESO", categoria: "MANTENIMIENTO" },
    { titulo: "Duda sobre política de contraseñas implementada", descripcion: "El administrador de Centro Hogar tiene dudas sobre la nueva política de contraseñas. No entiende por qué se rechazan contraseñas que antes funcionaban.", prioridad: "BAJA", estado: "ABIERTO", categoria: "CONSULTA" },
  ];
  for (const t of tickets) {
    await prisma.ticketSoporte.create({
      data: {
        id: id(),
        titulo: t.titulo,
        descripcion: t.descripcion,
        prioridad: t.prioridad,
        estado: t.estado,
        categoria: t.categoria,
        clienteNombre: "Muebleria Centro Hogar",
        proyectoId: PROYECTO_ID,
        creadorId: EMPLEADOS[8].id, // Laura Mendez (Soporte)
        asignadoAId: EMPLEADOS[8].id,
      },
    });
    log(`[${t.estado}] ${t.titulo}`);
  }

  // ── Notificaciones ──
  console.log("\n🔔 Creando notificaciones...");
  const notificaciones = [
    { titulo: "Proyecto asignado", mensaje: "Has sido asignado al proyecto Centro Hogar - Seguridad Informática Integral como Líder del Proyecto.", tipo: "ASIGNACION", empleadoIdx: 2 },
    { titulo: "Cambio de estado", mensaje: "El proyecto Centro Hogar cambió de PROPUESTA a APROBADO.", tipo: "ESTADO", empleadoIdx: 2 },
    { titulo: "Tarea completada", mensaje: "La tarea 'Revisar arquitectura y controles de acceso' ha sido marcada como COMPLETADA.", tipo: "TAREA", empleadoIdx: 5 },
    { titulo: "Nuevo hallazgo", mensaje: "Se registró un hallazgo de severidad ALTA: 'Conexión a MySQL con usuario root'.", tipo: "HALLAZGO", empleadoIdx: 4 },
    { titulo: "Informe listo", mensaje: "El informe de auditoría está listo para revisión. Estado: APROBADO.", tipo: "INFORME", empleadoIdx: 5 },
    { titulo: "Capacitación programada", mensaje: "Se programó la capacitación 'Seguridad en Desarrollo Web' para el equipo de Centro Hogar.", tipo: "CAPACITACION", empleadoIdx: 6 },
    { titulo: "Hito alcanzado", mensaje: "El hito 'Informe de auditoría entregado' fue completado el " + date(20).toLocaleDateString("es-AR") + ".", tipo: "HITO", empleadoIdx: 0 },
    { titulo: "Ticket abierto", mensaje: "Nuevo ticket de soporte: 'Consulta sobre configuración de CORS'.", tipo: "SOPORTE", empleadoIdx: 8 },
    { titulo: "Proyecto cerrado", mensaje: "El proyecto Centro Hogar - Seguridad Informática Integral ha sido cerrado exitosamente.", tipo: "ESTADO", empleadoIdx: 0 },
    { titulo: "Certificado emitido", mensaje: "Se emitieron 3 certificados de capacitación para el equipo de Centro Hogar.", tipo: "CERTIFICADO", empleadoIdx: 6 },
  ];
  for (const n of notificaciones) {
    await prisma.notificacion.create({
      data: {
        id: id(),
        titulo: n.titulo,
        mensaje: n.mensaje,
        tipo: n.tipo,
        leida: true,
        empleadoId: EMPLEADOS[n.empleadoIdx].id,
      },
    });
    log(`${n.titulo} → ${EMPLEADOS[n.empleadoIdx].nombre}`);
  }

  // ── Audit Log ──
  console.log("\n📝 Creando audit log...");
  const auditActions = [
    { accion: "CREATE", entidad: "Empleado", entidadId: EMPLEADOS[0].id, detalle: { email: EMPLEADOS[0].email } },
    { accion: "CREATE", entidad: "Cliente", entidadId: CLIENTE_ID, detalle: { razonSocial: "Muebleria Centro Hogar S.R.L." } },
    { accion: "CREATE", entidad: "Proyecto", entidadId: PROYECTO_ID, detalle: { nombre: "Centro Hogar - Seguridad Informática Integral" } },
    { accion: "UPDATE", entidad: "Proyecto", entidadId: PROYECTO_ID, detalle: { campo: "estado", anterior: "RELEVAMIENTO", nuevo: "PROPUESTA" } },
    { accion: "UPDATE", entidad: "Proyecto", entidadId: PROYECTO_ID, detalle: { campo: "estado", anterior: "PROPUESTA", nuevo: "APROBADO" } },
    { accion: "UPDATE", entidad: "Proyecto", entidadId: PROYECTO_ID, detalle: { campo: "estado", anterior: "APROBADO", nuevo: "EN_EJECUCION" } },
    { accion: "CREATE", entidad: "InformeAuditoria", entidadId: "audit-report-1", detalle: { hallazgos: 10, severidadMaxima: "ALTA" } },
    { accion: "CREATE", entidad: "HallazgoPentesting", entidadId: "pentest-1", detalle: { titulo: "Conexión a MySQL con usuario root", severidad: "ALTA" } },
    { accion: "UPDATE", entidad: "Proyecto", entidadId: PROYECTO_ID, detalle: { campo: "estado", anterior: "EN_EJECUCION", nuevo: "EN_REVISION" } },
    { accion: "UPDATE", entidad: "Proyecto", entidadId: PROYECTO_ID, detalle: { campo: "estado", anterior: "EN_REVISION", nuevo: "ENTREGADO" } },
    { accion: "UPDATE", entidad: "Proyecto", entidadId: PROYECTO_ID, detalle: { campo: "estado", anterior: "ENTREGADO", nuevo: "CERRADO" } },
    { accion: "CREATE", entidad: "Capacitacion", entidadId: capacitacionIds[0], detalle: { titulo: "Seguridad en Desarrollo Web", horas: 8 } },
    { accion: "CREATE", entidad: "CertificadoCapacitacion", entidadId: "cert-1", detalle: { codigo: "LOBEMO-2026-0001" } },
    { accion: "CREATE", entidad: "TicketSoporte", entidadId: "ticket-1", detalle: { titulo: "Consulta sobre configuración de CORS" } },
    { accion: "UPDATE", entidad: "Servicio", entidadId: SERVICIOS[0].id, detalle: { campo: "precioBase", nuevo: 850000 } },
  ];
  for (const a of auditActions) {
    await prisma.auditLog.create({
      data: {
        id: id(),
        accion: a.accion,
        entidad: a.entidad,
        entidadId: a.entidadId,
        detalle: a.detalle,
        empleadoId: EMPLEADOS[0].id,
      },
    });
    log(`${a.accion} ${a.entidad}`);
  }

  // ── Configuración ──
  console.log("\n⚙️  Creando configuración...");
  const configs = [
    { clave: "MAX_PROYECTOS_ACTIVOS_POR_EMPREADO", valor: "3", descripcion: "Límite de proyectos simultáneos (EN_EJECUCION o EN_REVISION) por empleado (RN-08)" },
    { clave: "DIAS_AVISO_VENCIMIENTO_PROPUESTA", valor: "7", descripcion: "Días de anticipación para notificar vencimiento de propuestas (RN-15c)" },
    { clave: "DIAS_AVISO_HITO", valor: "3", descripcion: "Días de anticipación para notificar fecha prevista de hitos" },
  ];
  for (const c of configs) {
    await prisma.configuracion.create({
      data: { id: id(), clave: c.clave, valor: c.valor, descripcion: c.descripcion },
    });
    log(`${c.clave} = ${c.valor}`);
  }

  // ── Segundo cliente (para proyecto activo) ──
  console.log("\n🏢 Creando segundo cliente...");
  await prisma.cliente.create({
    data: {
      id: CLIENTE_2_ID,
      razonSocial: "TechStore S.R.L.",
      cuit: "30-98765432-1",
      emailContacto: "contacto@techstore.com",
      telefono: "+54 11 5555-1234",
      direccion: "Av. Corrientes 4567, Buenos Aires",
      sector: "Comercio / Retail",
      activo: true,
    },
  });
  log("TechStore S.R.L.");

  // ── Proyecto activo (EN_EJECUCION) ──
  console.log("\n📁 Creando proyecto activo...");
  const proyectoActivoServicio = SERVICIOS[5]; // Soporte Técnico
  const codigoActivo = await generarCodigoProyecto("TechStore - Soporte Técnico Premium");
  await prisma.proyecto.create({
    data: {
      id: PROYECTO_ACTIVO_ID,
      codigo: codigoActivo,
      nombre: "TechStore - Soporte Técnico Premium",
      descripcion: "Servicio de soporte técnico premium para TechStore S.R.L. Incluye monitoreo 24/7, respuesta ante incidentes y mantenimiento preventivo.",
      estado: "EN_EJECUCION",
      fechaInicio: date(-10),
      fechaEstimadaFin: date(80),
      montoAcordado: 1800000,
      clienteId: CLIENTE_2_ID,
      servicioId: proyectoActivoServicio.id,
    },
  });
  log("TechStore - Soporte Técnico Premium (EN_EJECUCION)");

  // ── Asignaciones del proyecto activo ──
  console.log("\n👥 Creando asignaciones del proyecto activo...");
  for (const asig of ASIGNACIONES_ACTIVAS) {
    await prisma.asignacion.create({
      data: {
        id: asig.id,
        rolEnProyecto: asig.rol,
        proyectoId: PROYECTO_ACTIVO_ID,
        empleadoId: EMPLEADOS[asig.empleadoIdx].id,
      },
    });
    log(`${EMPLEADOS[asig.empleadoIdx].nombre} ${EMPLEADOS[asig.empleadoIdx].apellido} — ${asig.rol}`);
  }

  // ── Tareas del proyecto activo ──
  console.log("\n✅ Creando tareas del proyecto activo...");
  for (const tarea of TAREAS_ACTIVAS) {
    await prisma.tarea.create({
      data: {
        id: tarea.id,
        titulo: tarea.titulo,
        estado: tarea.estado,
        prioridad: tarea.prioridad,
        proyectoId: PROYECTO_ACTIVO_ID,
        asignacionId: ASIGNACIONES_ACTIVAS[0].id,
        createdAt: tarea.createdAt,
        fechaLimite: tarea.fechaLimite,
      },
    });
    log(`${tarea.titulo} (${tarea.estado})`);
  }

  // ── Comentarios de ejemplo (US-054) ──
  console.log("\n💬 Creando comentarios de ejemplo...");
  for (const c of COMENTARIOS_SEED) {
    await prisma.comentario.create({
      data: {
        id: id(),
        contenido: c.contenido,
        tareaId: TAREAS_ACTIVAS[c.tareaIdx].id,
        autorId: EMPLEADOS[c.autorIdx].id,
      },
    });
    log(`${EMPLEADOS[c.autorIdx].nombre}: "${c.contenido.slice(0, 50)}..."`);
  }

  console.log("\n🎉 Seed completado exitosamente!");
  console.log(`   ${EMPLEADOS.length} empleados | ${SERVICIOS.length} servicios | 2 clientes | 2 proyectos`);
  console.log(`   ${TAREAS.length + TAREAS_ACTIVAS.length} tareas | ${HALLAZGOS.length} hallazgos | ${hitos.length} hitos`);
  console.log(`   ${CAPACITACIONES.length} capacitaciones | ${ASISTENTES.length} asistentes`);
  console.log(`   ${tickets.length} tickets | ${notificaciones.length} notificaciones`);
  console.log(`   ${auditActions.length} audit logs | ${configs.length} configuraciones`);
  console.log(`   ${COMENTARIOS_SEED.length} comentarios de ejemplo`);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
