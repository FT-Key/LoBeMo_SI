-- AlterTable
ALTER TABLE "documentos" ALTER COLUMN "url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "proyectos" ALTER COLUMN "codigo" DROP DEFAULT;

-- CreateTable
CREATE TABLE "saved_filters" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "filtros" JSONB NOT NULL,
    "empleado_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_filters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_filters_empleado_id_modulo_nombre_key" ON "saved_filters"("empleado_id", "modulo", "nombre");

-- AddForeignKey
ALTER TABLE "saved_filters" ADD CONSTRAINT "saved_filters_empleado_id_fkey" FOREIGN KEY ("empleado_id") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
