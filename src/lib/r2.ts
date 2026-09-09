import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
})

const BUCKET = process.env.R2_BUCKET_NAME ?? "lobemo-docs"

export interface UploadResult {
  key: string
  url: string
}

export function buildStorageKey(proyectoId: string, filename: string): string {
  const ext = filename.split(".").pop() ?? "bin"
  const uuid = crypto.randomUUID()
  return `proyectos/${proyectoId}/${uuid}.${ext}`
}

export async function uploadToR2(
  proyectoId: string,
  filename: string,
  mimeType: string,
  body: Buffer | ReadableStream
): Promise<UploadResult> {
  const key = buildStorageKey(proyectoId, filename)

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: mimeType,
    })
  )

  return { key, url: `https://${BUCKET}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}` }
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  )
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })
  return getSignedUrl(r2Client, command, { expiresIn })
}

export function isR2Configured(): boolean {
  return !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME)
}
