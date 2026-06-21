-- Seed los 6 servicios predefinidos de LoBeMo
INSERT INTO "servicios" ("id", "nombre", "descripcion", "precio_base", "created_at", "updated_at")
VALUES
  ('sv_cuid_auditoria', 'AUDITORIA_ISO27001', 'Auditoría de cumplimiento ISO 27001: evaluación sistemática de los controles de seguridad de la información.', NULL, NOW(), NOW()),
  ('sv_cuid_pentesting', 'PENTESTING', 'Pruebas de penetración controladas para identificar vulnerabilidades explotables en sistemas, redes y aplicaciones.', NULL, NOW(), NOW()),
  ('sv_cuid_desarrollo', 'DESARROLLO_SEGURO', 'Desarrollo de software seguro: diseño, codificación y revisión de aplicaciones con enfoque en seguridad.', NULL, NOW(), NOW()),
  ('sv_cuid_consultoria', 'CONSULTORIA_REDES', 'Consultoría en infraestructura de redes: diseño, diagnóstico y optimización de redes corporativas seguras.', NULL, NOW(), NOW()),
  ('sv_cuid_capacitacion', 'CAPACITACION', 'Capacitación en ciberseguridad: formación teórico-práctica para equipos técnicos y no técnicos.', NULL, NOW(), NOW()),
  ('sv_cuid_soporte', 'SOPORTE_TECNICO', 'Soporte técnico especializado en seguridad informática: atención de incidentes y mantenimiento de sistemas.', NULL, NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;