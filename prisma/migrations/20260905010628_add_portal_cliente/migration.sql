-- AlterTable
ALTER TABLE "proyectos" ADD COLUMN     "portal_activo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "portal_clave" TEXT;

-- CreateTable
CREATE TABLE "sesiones_portal" (
    "id" TEXT NOT NULL,
    "proyecto_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesiones_portal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_portal_token_key" ON "sesiones_portal"("token");

-- AddForeignKey
ALTER TABLE "sesiones_portal" ADD CONSTRAINT "sesiones_portal_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
