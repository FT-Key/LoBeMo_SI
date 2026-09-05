"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { PortalContent } from "./portal-content"

type ProyectoData = {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  estado: string
  fechaInicio: string
  fechaEstimadaFin: string | null
  fechaEntregaReal: string | null
  createdAt: string
  cliente: { razonSocial: string; sector: string | null }
  servicio: { nombre: string; descripcion: string | null }
  historialEstados: { id: string; estadoAnterior: string | null; estadoNuevo: string; createdAt: string }[]
  hitos: { id: string; nombre: string; descripcion: string | null; fechaPrevista: string; fechaReal: string | null; completado: boolean }[]
  documentos: { id: string; nombreArchivo: string; tipo: string; createdAt: string }[]
  informesAuditoria: { id: string; alcance: string; criteriosAuditoria: string; hallazgos: unknown; noConformidades: unknown; observaciones: unknown; recomendaciones: unknown; fechaEmision: string | null; createdAt: string }[]
  hallazgosPentesting: { id: string; titulo: string; descripcion: string; severidad: string; evidencia: string | null; recomendacion: string | null; estado: string; createdAt: string }[]
}

export default function SeguimientoProyectoPage() {
  const params = useParams()
  const codigo = params.codigo as string
  const [proyecto, setProyecto] = useState<ProyectoData | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProyecto() {
      try {
        const res = await fetch("/api/portal/proyecto")
        if (res.status === 401) {
          window.location.href = "/seguimiento"
          return
        }
        if (!res.ok) {
          setError("No se pudieron cargar los datos del proyecto")
          setLoading(false)
          return
        }
        const data = await res.json()
        if (data.codigo !== codigo) {
          setError("No tenés acceso a este proyecto")
          setLoading(false)
          return
        }
        setProyecto(data)
      } catch {
        setError("Error de conexión")
      }
      setLoading(false)
    }
    fetchProyecto()
  }, [codigo])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-[#94a3b8] text-sm">Cargando...</div>
      </div>
    )
  }

  if (error || !proyecto) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-4">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-400 text-sm mb-4">{error || "Proyecto no encontrado"}</p>
          <Link href="/seguimiento" className="text-[#00d4ff] text-sm hover:underline">Volver al acceso</Link>
        </div>
      </div>
    )
  }

  return <PortalContent proyecto={proyecto} />
}
