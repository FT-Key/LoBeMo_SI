CREATE TABLE "configuracion" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "configuracion_clave_key" ON "configuracion"("clave");
