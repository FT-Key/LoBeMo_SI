-- AlterTable
ALTER TABLE "notificaciones" ADD COLUMN     "link" TEXT;

-- CreateTable
CREATE TABLE "informes_auditoria" (
    "id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "creador_id" TEXT NOT NULL,
    "alcance" TEXT NOT NULL,
    "criterios_auditoria" TEXT NOT NULL,
    "hallazgos" JSONB NOT NULL DEFAULT '[]',
    "no_conformidades" JSONB NOT NULL DEFAULT '[]',
    "observaciones" JSONB NOT NULL DEFAULT '[]',
    "recomendaciones" JSONB NOT NULL DEFAULT '[]',
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "fecha_emision" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "informes_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capacitaciones" (
    "id" TEXT NOT NULL,
    "proyecto_id" TEXT,
    "titulo" TEXT NOT NULL,
    "temario" TEXT NOT NULL,
    "duracion_horas" INTEGER NOT NULL,
    "modalidad" TEXT NOT NULL DEFAULT 'PRESENCIAL',
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'PLANIFICADA',
    "materiales" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capacitaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistentes_capacitacion" (
    "id" TEXT NOT NULL,
    "capacitacion_id" TEXT NOT NULL,
    "nombre_asistente" TEXT NOT NULL,
    "email_asistente" TEXT NOT NULL,
    "organizacion" TEXT,
    "evaluacion" INTEGER,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asistentes_capacitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificados_capacitacion" (
    "id" TEXT NOT NULL,
    "asistente_id" TEXT NOT NULL,
    "codigo_certificado" TEXT NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificados_capacitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets_soporte" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "prioridad" TEXT NOT NULL DEFAULT 'MEDIA',
    "estado" TEXT NOT NULL DEFAULT 'ABIERTO',
    "categoria" TEXT,
    "cliente_nombre" TEXT,
    "proyecto_id" TEXT,
    "creador_id" TEXT NOT NULL,
    "asignado_a_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_soporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certificados_capacitacion_asistente_id_key" ON "certificados_capacitacion"("asistente_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificados_capacitacion_codigo_certificado_key" ON "certificados_capacitacion"("codigo_certificado");

-- AddForeignKey
ALTER TABLE "informes_auditoria" ADD CONSTRAINT "informes_auditoria_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "informes_auditoria" ADD CONSTRAINT "informes_auditoria_creador_id_fkey" FOREIGN KEY ("creador_id") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacitaciones" ADD CONSTRAINT "capacitaciones_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistentes_capacitacion" ADD CONSTRAINT "asistentes_capacitacion_capacitacion_id_fkey" FOREIGN KEY ("capacitacion_id") REFERENCES "capacitaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados_capacitacion" ADD CONSTRAINT "certificados_capacitacion_asistente_id_fkey" FOREIGN KEY ("asistente_id") REFERENCES "asistentes_capacitacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_soporte" ADD CONSTRAINT "tickets_soporte_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_soporte" ADD CONSTRAINT "tickets_soporte_creador_id_fkey" FOREIGN KEY ("creador_id") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets_soporte" ADD CONSTRAINT "tickets_soporte_asignado_a_id_fkey" FOREIGN KEY ("asignado_a_id") REFERENCES "empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE;
