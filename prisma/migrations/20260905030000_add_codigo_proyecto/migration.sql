-- AlterTable: Add codigo column with temporary default
ALTER TABLE "proyectos" ADD COLUMN "codigo" TEXT NOT NULL DEFAULT 'LBM-TEMP-0000';

-- Backfill existing projects with generated codes
UPDATE "proyectos" SET "codigo" = 'LBM-PROY-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 4)) WHERE "codigo" = 'LBM-TEMP-0000';

-- CreateUniqueIndex
CREATE UNIQUE INDEX "proyectos_codigo_key" ON "proyectos"("codigo");
