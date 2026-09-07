"use client"

import { useCallback, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

const MIMES_PERMITIDOS = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
]

const MAX_SIZE = 25 * 1024 * 1024

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️"
  if (mimeType === "application/pdf") return "📄"
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝"
  if (mimeType.includes("excel") || mimeType.includes("sheet")) return "📊"
  if (mimeType.startsWith("text/")) return "📃"
  return "📎"
}

interface FileUploadProps {
  proyectoId: string
  tareaId?: string
  tipo?: string
  onUploaded?: (documento: { id: string; nombreArchivo: string; storageKey: string }) => void
  onError?: (error: string) => void
  disabled?: boolean
}

export function FileUpload({
  proyectoId,
  tareaId,
  tipo = "OTRO",
  onUploaded,
  onError,
  disabled = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (!MIMES_PERMITIDOS.includes(file.type)) {
      return "Tipo de archivo no soportado. Usa PDF, imágenes, Office o texto."
    }
    if (file.size > MAX_SIZE) {
      return `El archivo es demasiado grande (${formatBytes(file.size)}). Máximo 25MB.`
    }
    return null
  }, [])

  const uploadFile = useCallback(
    async (file: File) => {
      const error = validateFile(file)
      if (error) {
        onError?.(error)
        return
      }

      setIsUploading(true)
      setUploadProgress(`Subiendo ${file.name}...`)

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("proyectoId", proyectoId)
        formData.append("tipo", tipo)
        if (tareaId) formData.append("tareaId", tareaId)

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Error al subir el archivo")
        }

        const doc = await res.json()
        setUploadProgress("")
        onUploaded?.(doc)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al subir el archivo"
        onError?.(msg)
        setUploadProgress("")
      } finally {
        setIsUploading(false)
      }
    },
    [proyectoId, tareaId, tipo, validateFile, onUploaded, onError]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (disabled || isUploading) return
      const file = e.dataTransfer.files[0]
      if (file) uploadFile(file)
    },
    [disabled, isUploading, uploadFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) uploadFile(file)
      if (inputRef.current) inputRef.current.value = ""
    },
    [uploadFile]
  )

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative rounded-lg border-2 border-dashed p-6 text-center transition-colors
        ${isDragOver ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-gray-300 dark:border-gray-700"}
        ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400 dark:hover:border-gray-600"}
      `}
      onClick={() => !disabled && !isUploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={MIMES_PERMITIDOS.join(",")}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">{uploadProgress}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl">📁</div>
          <p className="text-sm font-medium">
            {isDragOver ? "Suelta el archivo aquí" : "Arrastra un archivo o haz clic para seleccionar"}
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, imágenes, Word, Excel, texto — Máx. 25MB
          </p>
          <Button type="button" variant="outline" size="sm" disabled={disabled}>
            Seleccionar archivo
          </Button>
        </div>
      )}
    </div>
  )
}

export { formatBytes, getIcon, MIMES_PERMITIDOS }
