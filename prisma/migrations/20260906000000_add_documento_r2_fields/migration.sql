-- AlterTable
ALTER TABLE "documentos" ADD COLUMN "mime_type" TEXT,
ADD COLUMN "tamanio" INTEGER,
ADD COLUMN "storage_key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "documentos_storage_key_key" ON "documentos"("storage_key");

-- Migrate existing data: extract MIME from data URLs
UPDATE "documentos"
SET "mime_type" = CASE
  WHEN "url" LIKE 'data:%' THEN SUBSTRING("url" FROM 6 FOR POSITION(';base64' IN "url") - 6)
  ELSE NULL
END
WHERE "url" IS NOT NULL AND "url" LIKE 'data:%';
