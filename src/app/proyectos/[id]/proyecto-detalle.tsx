"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const ESTADO_BADGES: Record<string, string> = {
  RELEVAMIENTO: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  PROPUESTA: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
  APROBADO: "bg-green-500/15 text-green-400 border border-green-500/25",
  EN_EJECUCION: "bg-teal-500/15 text-teal-400 border border-teal-500/25",
  EN_REVISION: "bg-purple-500/15 text-purple-400 border border-purple-500/25",
  ENTREGADO: "bg-primary/15 text-primary border border-primary/25",
  CERRADO: "bg-muted text-muted-foreground border border-border",
}

const TAREA_ESTADO_BADGES: Record<string, string> = {
  PENDIENTE: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
  EN_PROGRESO: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  COMPLETADA: "bg-green-500/15 text-green-400 border border-green-500/25",
  CANCELADA: "bg-muted text-muted-foreground border border-border",
}

const PRIORIDAD_BADGES: Record<string, string> = {
  BAJA: "bg-gray-500/15 text-gray-400 border border-gray-500/25",
  MEDIA: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  ALTA: "bg-orange-500/15 text-orange-400 border border-orange-500/25",
  CRITICA: "bg-red-500/15 text-red-400 border border-red-500/25",
}

const NOMBRES_SERVICIOS: Record<string, string> = {
  AUDITORIA_ISO27001: "Auditoría ISO 27001",
  PENTESTING: "Pentesting",
  DESARROLLO_SEGURO: "Desarrollo Seguro",
  CONSULTORIA_REDES: "Consultoría en Redes",
  CAPACITACION: "Capacitación",
  SOPORTE_TECNICO: "Soporte Técnico",
}

const DOC_TIPO_LABELS: Record<string, string> = {
  INFORME_AUDITORIA: "Informe de Auditoría",
  REPORTE_PENTESTING: "Reporte de Pentesting",
  CODIGO_FUENTE: "Código Fuente",
  CONFIG_RED: "Configuración de Red",
  MATERIAL_CAPACITACION: "Material de Capacitación",
  CONTRATO: "Contrato",
  OTRO: "Otro",
}

const DOC_TIPO_BADGES: Record<string, string> = {
  INFORME_AUDITORIA: "bg-purple-500/15 text-purple-400 border border-purple-500/25",
  REPORTE_PENTESTING: "bg-red-500/15 text-red-400 border border-red-500/25",
  CODIGO_FUENTE: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  CONFIG_RED: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25",
  MATERIAL_CAPACITACION: "bg-green-500/15 text-green-400 border border-green-500/25",
  CONTRATO: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
  OTRO: "bg-gray-500/15 text-gray-400 border border-gray-500/25",
}

const ROL_LABELS: Record<string, string> = {
  GERENTE_GENERAL: "Gerente General",
  ADMINISTRACION: "Administración y Contabilidad",
  VENTAS: "Ventas y Atención al Cliente",
  CISO: "CISO",
  ANALISTA_SEGURIDAD: "Analista de Seguridad",
  DESARROLLADOR: "Desarrollador de Software Seguro",
  ESPECIALISTA_REDES: "Especialista en Redes",
  PENTESTER: "Pentester",
  SOPORTE_TECNICO: "Soporte Técnico",
  AUDITOR: "Auditor de Seguridad",
  CAPACITADOR: "Capacitador en Ciberseguridad",
}

type EmpleadoBrief = {
  id: string
  nombre: string
  apellido: string
  rol: string
  area: string
}

type TareaAsignacion = {
  id: string
  empleado: { id: string; nombre: string; apellido: string; rol: string }
}

type TareaItem = {
  id: string
  titulo: string
  descripcion: string | null
  estado: string
  prioridad: string
  fechaLimite: string | null
  createdAt: string
  asignacion: TareaAsignacion | null
  asignacionId: string | null
}

type ProyectoDetalleProps = {
  proyecto: Record<string, unknown>
  sessionRol: string
  sessionUserId: string
  estadoLabels: Record<string, string>
  empleados: EmpleadoBrief[]
}

export function ProyectoDetalle({ proyecto, sessionRol, sessionUserId, estadoLabels, empleados }: ProyectoDetalleProps) {
  const router = useRouter()
  const [transitioning, setTransitioning] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const p = proyecto as {
    id: string
    nombre: string
    descripcion: string | null
    estado: string
    fechaInicio: string
    fechaEstimadaFin: string | null
    fechaEntregaReal: string | null
    montoAcordado: string | null
    cliente: { id: string; razonSocial: string; cuit: string }
    servicio: { id: string; nombre: string }
    propuestas: Array<{ id: string; version: number; montoTotal: string; estado: string }>
    asignaciones: Array<{
      id: string
      rolEnProyecto: string
      empleado: { id: string; nombre: string; apellido: string; rol: string }
    }>
    tareas: TareaItem[]
    hitos: Array<{ id: string; nombre: string; descripcion: string | null; fechaPrevista: string; fechaReal: string | null; completado: boolean }>
    documentos: Array<{ id: string; nombreArchivo: string; tipo: string; url: string; createdAt: string; tareaId: string | null }>
    historialEstados: Array<{
      id: string
      estadoAnterior: string | null
      estadoNuevo: string
      createdAt: string
      empleado: { id: string; nombre: string; apellido: string } | null
    }>
    _count: { tareas: number; asignaciones: number; propuestas: number; documentos: number }
  }

  const esCisoOGerente = sessionRol === "CISO" || sessionRol === "GERENTE_GENERAL"
  const estaAsignado = p.asignaciones.some((a) => a.empleado.id === sessionUserId)
  const puedeGestionarTareas = esCisoOGerente || estaAsignado
  const esCerrado = p.estado === "CERRADO"

  const puedeTransicionar = ["GERENTE_GENERAL", "CISO", "ADMINISTRACION", "VENTAS"].includes(sessionRol)

  const puedeAsignar = ["GERENTE_GENERAL", "CISO"].includes(sessionRol)
  const estadosAsignables = ["APROBADO", "EN_EJECUCION"]
  const puedeAsignarAhora = puedeAsignar && estadosAsignables.includes(p.estado)

  const [asignando, setAsignando] = useState(false)
  const [asignarEmpleadoId, setAsignarEmpleadoId] = useState("")
  const [asignarRol, setAsignarRol] = useState("")
  const [asignarError, setAsignarError] = useState("")
  const [asignarSuccess, setAsignarSuccess] = useState("")
  const [deletingId, setDeletingId] = useState("")

  const [tareaTitulo, setTareaTitulo] = useState("")
  const [tareaDescripcion, setTareaDescripcion] = useState("")
  const [tareaPrioridad, setTareaPrioridad] = useState("MEDIA")
  const [tareaFechaLimite, setTareaFechaLimite] = useState("")
  const [tareaError, setTareaError] = useState("")
  const [tareaSuccess, setTareaSuccess] = useState("")
  const [creandoTarea, setCreandoTarea] = useState(false)

  const [editandoTareaId, setEditandoTareaId] = useState<string | null>(null)
  const [editandoEstado, setEditandoEstado] = useState("")
  const [editandoPrioridad, setEditandoPrioridad] = useState("")
  const [editandoTitulo, setEditandoTitulo] = useState("")
  const [editandoDescripcion, setEditandoDescripcion] = useState("")
  const [editandoFechaLimite, setEditandoFechaLimite] = useState("")
  const [editandoLoading, setEditandoLoading] = useState(false)
  const [eliminandoTareaId, setEliminandoTareaId] = useState<string | null>(null)

  const [hitoNombre, setHitoNombre] = useState("")
  const [hitoDescripcion, setHitoDescripcion] = useState("")
  const [hitoFechaPrevista, setHitoFechaPrevista] = useState("")
  const [hitoError, setHitoError] = useState("")
  const [hitoSuccess, setHitoSuccess] = useState("")
  const [creandoHito, setCreandoHito] = useState(false)

  const [editandoHitoId, setEditandoHitoId] = useState<string | null>(null)
  const [editHitoNombre, setEditHitoNombre] = useState("")
  const [editHitoDescripcion, setEditHitoDescripcion] = useState("")
  const [editHitoFechaPrevista, setEditHitoFechaPrevista] = useState("")
  const [editHitoFechaReal, setEditHitoFechaReal] = useState("")
  const [editHitoCompletado, setEditHitoCompletado] = useState(false)
  const [editandoHitoLoading, setEditandoHitoLoading] = useState(false)
  const [eliminandoHitoId, setEliminandoHitoId] = useState<string | null>(null)

  const [docArchivo, setDocArchivo] = useState<File | null>(null)
  const [docTipo, setDocTipo] = useState("OTRO")
  const [docSubiendo, setDocSubiendo] = useState(false)
  const [docError, setDocError] = useState("")
  const [docSuccess, setDocSuccess] = useState("")
  const [viendoDocId, setViendoDocId] = useState<string | null>(null)
  const [eliminandoDocId, setEliminandoDocId] = useState<string | null>(null)

  const transicionesPosibles: Record<string, string[]> = {
    RELEVAMIENTO: ["PROPUESTA"],
    PROPUESTA: ["APROBADO"],
    APROBADO: ["EN_EJECUCION"],
    EN_EJECUCION: ["EN_REVISION"],
    EN_REVISION: ["EN_EJECUCION", "ENTREGADO"],
    ENTREGADO: ["CERRADO"],
    CERRADO: [],
  }

  const posibles = transicionesPosibles[p.estado] ?? []

  async function handleTransicion(nuevoEstado: string) {
    setError("")
    setSuccess("")
    setTransitioning(true)

    try {
      const res = await fetch(`/api/proyectos/${p.id}/transicion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevoEstado }),
      })

      const json = await res.json()
      if (res.ok) {
        setSuccess(`Proyecto movido a "${estadoLabels[nuevoEstado] ?? nuevoEstado}"`)
        router.refresh()
      } else {
        setError(json.error || "Error al cambiar estado")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setTransitioning(false)
    }
  }

  const idsAsignados = new Set(p.asignaciones.map((a) => a.empleado.id))
  const empleadosDisponibles = empleados.filter((e) => !idsAsignados.has(e.id))

  async function handleAsignar() {
    setAsignarError("")
    setAsignarSuccess("")
    if (!asignarEmpleadoId || !asignarRol) {
      setAsignarError("Selecciona un empleado y un rol")
      return
    }
    setAsignando(true)
    try {
      const res = await fetch("/api/asignaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proyectoId: p.id, empleadoId: asignarEmpleadoId, rolEnProyecto: asignarRol }),
      })
      const json = await res.json()
      if (res.ok) {
        setAsignarSuccess(`Empleado asignado como ${asignarRol}`)
        setAsignarEmpleadoId("")
        setAsignarRol("")
        router.refresh()
      } else {
        setAsignarError(json.error || "Error al asignar")
      }
    } catch {
      setAsignarError("Error de conexión")
    } finally {
      setAsignando(false)
    }
  }

  async function handleDeleteAsignacion(asignacionId: string) {
    setError("")
    setDeletingId(asignacionId)
    try {
      const res = await fetch(`/api/asignaciones/${asignacionId}`, { method: "DELETE" })
      if (res.ok) {
        setSuccess("Asignación eliminada")
        router.refresh()
      } else {
        const json = await res.json()
        setError(json.error || "Error al eliminar")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setDeletingId("")
    }
  }

  async function handleCrearTarea(e: React.FormEvent) {
    e.preventDefault()
    setTareaError("")
    setTareaSuccess("")

    if (!tareaTitulo.trim()) {
      setTareaError("El título es obligatorio")
      return
    }

    setCreandoTarea(true)
    try {
      const res = await fetch("/api/tareas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proyectoId: p.id,
          titulo: tareaTitulo.trim(),
          descripcion: tareaDescripcion.trim() || null,
          prioridad: tareaPrioridad,
          fechaLimite: tareaFechaLimite || null,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setTareaSuccess("Tarea creada")
        setTareaTitulo("")
        setTareaDescripcion("")
        setTareaPrioridad("MEDIA")
        setTareaFechaLimite("")
        router.refresh()
      } else {
        setTareaError(json.error || "Error al crear tarea")
      }
    } catch {
      setTareaError("Error de conexión")
    } finally {
      setCreandoTarea(false)
    }
  }

  function iniciarEdicion(t: TareaItem) {
    setEditandoTareaId(t.id)
    setEditandoEstado(t.estado)
    setEditandoPrioridad(t.prioridad)
    setEditandoTitulo(t.titulo)
    setEditandoDescripcion(t.descripcion ?? "")
    setEditandoFechaLimite(t.fechaLimite ? t.fechaLimite.split("T")[0] : "")
    setEditandoLoading(false)
  }

  function cancelarEdicion() {
    setEditandoTareaId(null)
  }

  async function handleGuardarTarea() {
    if (!editandoTareaId) return
    setEditandoLoading(true)
    setError("")

    const body: Record<string, unknown> = {}
    if (editandoTitulo.trim()) body.titulo = editandoTitulo.trim()
    body.descripcion = editandoDescripcion.trim() || null
    body.estado = editandoEstado
    body.prioridad = editandoPrioridad
    body.fechaLimite = editandoFechaLimite || null

    try {
      const res = await fetch(`/api/tareas/${editandoTareaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (res.ok) {
        setSuccess("Tarea actualizada")
        setEditandoTareaId(null)
        router.refresh()
      } else {
        setError(json.error || "Error al actualizar tarea")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setEditandoLoading(false)
    }
  }

  async function handleEliminarTarea(tareaId: string) {
    setEliminandoTareaId(tareaId)
    setError("")
    try {
      const res = await fetch(`/api/tareas/${tareaId}`, { method: "DELETE" })
      if (res.ok) {
        setSuccess("Tarea eliminada")
        router.refresh()
      } else {
        const json = await res.json()
        setError(json.error || "Error al eliminar tarea")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setEliminandoTareaId("")
    }
  }

  async function handleCrearHito(e: React.FormEvent) {
    e.preventDefault()
    setHitoError("")
    setHitoSuccess("")

    if (!hitoNombre.trim() || !hitoFechaPrevista) {
      setHitoError("Nombre y fecha prevista son obligatorios")
      return
    }

    setCreandoHito(true)
    try {
      const res = await fetch("/api/hitos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proyectoId: p.id,
          nombre: hitoNombre.trim(),
          descripcion: hitoDescripcion.trim() || null,
          fechaPrevista: hitoFechaPrevista,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setHitoSuccess("Hito creado")
        setHitoNombre("")
        setHitoDescripcion("")
        setHitoFechaPrevista("")
        router.refresh()
      } else {
        setHitoError(json.error || "Error al crear hito")
      }
    } catch {
      setHitoError("Error de conexión")
    } finally {
      setCreandoHito(false)
    }
  }

  function iniciarEdicionHito(h: typeof p.hitos[0]) {
    setEditandoHitoId(h.id)
    setEditHitoNombre(h.nombre)
    setEditHitoDescripcion(h.descripcion ?? "")
    setEditHitoFechaPrevista(h.fechaPrevista.split("T")[0])
    setEditHitoFechaReal(h.fechaReal ? h.fechaReal.split("T")[0] : "")
    setEditHitoCompletado(h.completado)
    setEditandoHitoLoading(false)
  }

  function cancelarEdicionHito() {
    setEditandoHitoId(null)
  }

  async function handleGuardarHito() {
    if (!editandoHitoId) return
    setEditandoHitoLoading(true)
    setError("")

    const body: Record<string, unknown> = {}
    if (editHitoNombre.trim()) body.nombre = editHitoNombre.trim()
    body.descripcion = editHitoDescripcion.trim() || null
    body.fechaPrevista = editHitoFechaPrevista
    body.fechaReal = editHitoFechaReal || null
    body.completado = editHitoCompletado

    try {
      const res = await fetch(`/api/hitos/${editandoHitoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (res.ok) {
        setSuccess("Hito actualizado")
        setEditandoHitoId(null)
        router.refresh()
      } else {
        setError(json.error || "Error al actualizar hito")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setEditandoHitoLoading(false)
    }
  }

  function leerArchivoBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error("Error al leer el archivo"))
      reader.readAsDataURL(file)
    })
  }

  async function handleSubirDocumento(e: React.FormEvent) {
    e.preventDefault()
    setDocError("")
    setDocSuccess("")

    if (!docArchivo) {
      setDocError("Selecciona un archivo")
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (docArchivo.size > maxSize) {
      setDocError("El archivo no puede superar los 10MB")
      return
    }

    const tiposValidos = [
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

    if (!tiposValidos.includes(docArchivo.type) && !docArchivo.name.match(/\.(pdf|png|jpg|jpeg|gif|webp|doc|docx|xls|xlsx|txt|csv)$/i)) {
      setDocError("Tipo de archivo no soportado. Usa PDF, imágenes, Office o texto.")
      return
    }

    setDocSubiendo(true)
    try {
      const base64 = await leerArchivoBase64(docArchivo)

      const res = await fetch("/api/documentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proyectoId: p.id,
          nombreArchivo: docArchivo.name,
          tipo: docTipo,
          url: base64,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setDocSuccess("Documento subido correctamente")
        setDocArchivo(null)
        setDocTipo("OTRO")
        router.refresh()
      } else {
        setDocError(json.error || "Error al subir documento")
      }
    } catch {
      setDocError("Error de conexión")
    } finally {
      setDocSubiendo(false)
    }
  }

  function formatearTamano(base64: string): string {
    const bytes = Math.round((base64.length * 3) / 4)
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function handleEliminarDocumento(docId: string) {
    setEliminandoDocId(docId)
    setError("")
    try {
      const res = await fetch(`/api/documentos/${docId}`, { method: "DELETE" })
      if (res.ok) {
        setSuccess("Documento eliminado")
        router.refresh()
      } else {
        const json = await res.json()
        setError(json.error || "Error al eliminar documento")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setEliminandoDocId("")
    }
  }

  async function handleEliminarHito(hitoId: string) {
    setEliminandoHitoId(hitoId)
    setError("")
    try {
      const res = await fetch(`/api/hitos/${hitoId}`, { method: "DELETE" })
      if (res.ok) {
        setSuccess("Hito eliminado")
        router.refresh()
      } else {
        const json = await res.json()
        setError(json.error || "Error al eliminar hito")
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setEliminandoHitoId("")
    }
  }

  function diasHastaFecha(fechaStr: string): number {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const fecha = new Date(fechaStr)
    fecha.setHours(0, 0, 0, 0)
    return Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-500/15 border border-red-500/25 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-500/15 border border-green-500/25 p-3 text-sm text-green-400">
          {success}
        </div>
      )}

      <div className="rounded-lg border bg-surface-elevated/80 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{p.nombre}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Cliente: {p.cliente.razonSocial} — Servicio: {NOMBRES_SERVICIOS[p.servicio.nombre] ?? p.servicio.nombre.replace(/_/g, " ")}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${ESTADO_BADGES[p.estado] ?? ""}`}>
            {estadoLabels[p.estado] ?? p.estado}
          </span>
        </div>

        {p.descripcion && (
          <p className="text-sm text-muted-foreground mb-4">{p.descripcion}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Inicio</span>
            <p className="font-medium">{new Date(p.fechaInicio).toLocaleDateString("es-AR")}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Fin estimado</span>
            <p className="font-medium">{p.fechaEstimadaFin ? new Date(p.fechaEstimadaFin).toLocaleDateString("es-AR") : "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Monto acordado</span>
            <p className="font-medium">{p.montoAcordado ? `ARS ${Number(p.montoAcordado).toLocaleString("es-AR", { minimumFractionDigits: 2 })}` : "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Propuestas</span>
            <p className="font-medium">{p._count.propuestas}</p>
          </div>
        </div>
      </div>

      {!esCerrado && posibles.length > 0 && puedeTransicionar && (
        <div className="rounded-lg border bg-surface-elevated/80 p-6">
          <h3 className="text-lg font-semibold mb-3">Transiciones de estado</h3>
          <div className="flex flex-wrap gap-2">
            {posibles.map((est) => (
              <button
                key={est}
                onClick={() => handleTransicion(est)}
                disabled={transitioning}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
              >
                {transitioning ? "Procesando..." : `Mover a ${estadoLabels[est] ?? est}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-surface-elevated/80 p-6">
          <h3 className="text-lg font-semibold mb-3">Asignaciones ({p._count.asignaciones})</h3>

          {asignarError && (
            <div className="rounded-md bg-red-500/15 border border-red-500/25 p-2 mb-3 text-xs text-red-400">{asignarError}</div>
          )}
          {asignarSuccess && (
            <div className="rounded-md bg-green-500/15 border border-green-500/25 p-2 mb-3 text-xs text-green-400">{asignarSuccess}</div>
          )}

          {puedeAsignarAhora && (
            <div className="mb-4 p-3 rounded-md bg-muted/30 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Nueva asignación</p>
              <select
                value={asignarEmpleadoId}
                onChange={(e) => setAsignarEmpleadoId(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
              >
                <option value="">Seleccionar empleado</option>
                {empleadosDisponibles.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.apellido}, {emp.nombre} — {ROL_LABELS[emp.rol] ?? emp.rol}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={asignarRol}
                onChange={(e) => setAsignarRol(e.target.value)}
                placeholder="Rol en el proyecto (ej: Pentester líder)"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
              />
              <button
                onClick={handleAsignar}
                disabled={asignando}
                className="inline-flex h-8 w-full items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
              >
                {asignando ? "Asignando..." : "Asignar empleado"}
              </button>
            </div>
          )}

          {p.asignaciones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin empleados asignados</p>
          ) : (
            <ul className="space-y-2">
              {p.asignaciones.map((a) => (
                <li key={a.id} className="text-sm flex items-center justify-between">
                  <span>
                    {a.empleado.nombre} {a.empleado.apellido}
                    <span className="text-xs text-muted-foreground ml-2">({ROL_LABELS[a.empleado.rol] ?? a.empleado.rol})</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{a.rolEnProyecto}</span>
                    {puedeAsignar && p.estado !== "CERRADO" && (
                      <button
                        onClick={() => handleDeleteAsignacion(a.id)}
                        disabled={deletingId === a.id}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        {deletingId === a.id ? "..." : "✕"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border bg-surface-elevated/80 p-6">
          <h3 className="text-lg font-semibold mb-3">Tareas ({p._count.tareas})</h3>

          {tareaError && (
            <div className="rounded-md bg-red-500/15 border border-red-500/25 p-2 mb-3 text-xs text-red-400">{tareaError}</div>
          )}
          {tareaSuccess && (
            <div className="rounded-md bg-green-500/15 border border-green-500/25 p-2 mb-3 text-xs text-green-400">{tareaSuccess}</div>
          )}

          {puedeGestionarTareas && !esCerrado && (
            <form onSubmit={handleCrearTarea} className="mb-4 p-3 rounded-md bg-muted/30 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Nueva tarea</p>
              <input
                type="text"
                value={tareaTitulo}
                onChange={(e) => setTareaTitulo(e.target.value)}
                placeholder="Título de la tarea"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
              />
              <textarea
                value={tareaDescripcion}
                onChange={(e) => setTareaDescripcion(e.target.value)}
                placeholder="Descripción (opcional)"
                rows={2}
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm resize-none"
              />
              <div className="flex gap-2">
                <select
                  value={tareaPrioridad}
                  onChange={(e) => setTareaPrioridad(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="CRITICA">Crítica</option>
                </select>
                <input
                  type="date"
                  value={tareaFechaLimite}
                  onChange={(e) => setTareaFechaLimite(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={creandoTarea}
                className="inline-flex h-8 w-full items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
              >
                {creandoTarea ? "Creando..." : "Crear tarea"}
              </button>
            </form>
          )}

          {p.tareas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin tareas registradas</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {p.tareas.map((t) => (
                <div key={t.id} className="rounded-md border bg-muted/10 p-3">
                  {editandoTareaId === t.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editandoTitulo}
                        onChange={(e) => setEditandoTitulo(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm font-medium"
                      />
                      <textarea
                        value={editandoDescripcion}
                        onChange={(e) => setEditandoDescripcion(e.target.value)}
                        rows={2}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm resize-none"
                      />
                      <div className="flex gap-2">
                        <select
                          value={editandoEstado}
                          onChange={(e) => setEditandoEstado(e.target.value)}
                          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="EN_PROGRESO">En Progreso</option>
                          <option value="COMPLETADA">Completada</option>
                          <option value="CANCELADA">Cancelada</option>
                        </select>
                        <select
                          value={editandoPrioridad}
                          onChange={(e) => setEditandoPrioridad(e.target.value)}
                          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                        >
                          <option value="BAJA">Baja</option>
                          <option value="MEDIA">Media</option>
                          <option value="ALTA">Alta</option>
                          <option value="CRITICA">Crítica</option>
                        </select>
                      </div>
                      <input
                        type="date"
                        value={editandoFechaLimite}
                        onChange={(e) => setEditandoFechaLimite(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleGuardarTarea}
                          disabled={editandoLoading}
                          className="inline-flex h-7 flex-1 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                        >
                          {editandoLoading ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          className="inline-flex h-7 flex-1 items-center justify-center rounded-md bg-muted px-3 text-xs font-medium hover:bg-muted/80"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm font-medium">{t.titulo}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORIDAD_BADGES[t.prioridad] ?? ""}`}>
                            {t.prioridad}
                          </span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${TAREA_ESTADO_BADGES[t.estado] ?? ""}`}>
                            {t.estado.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                      {t.descripcion && (
                        <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{t.descripcion}</p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>
                          {t.asignacion
                            ? `${t.asignacion.empleado.nombre} ${t.asignacion.empleado.apellido}`
                            : "Sin asignar"}
                          {t.fechaLimite && ` — ${new Date(t.fechaLimite).toLocaleDateString("es-AR")}`}
                        </span>
                        <div className="flex gap-2">
                          {puedeGestionarTareas && !esCerrado && (
                            <button
                              onClick={() => iniciarEdicion(t)}
                              className="text-primary hover:underline"
                            >
                              Editar
                            </button>
                          )}
                          {esCisoOGerente && !esCerrado && (
                            <button
                              onClick={() => handleEliminarTarea(t.id)}
                              disabled={eliminandoTareaId === t.id}
                              className="text-red-400 hover:text-red-300 disabled:opacity-50"
                            >
                              {eliminandoTareaId === t.id ? "..." : "✕"}
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-surface-elevated/80 p-6">
        <h3 className="text-lg font-semibold mb-3">Hitos ({p.hitos.length})</h3>

        {hitoError && (
          <div className="rounded-md bg-red-500/15 border border-red-500/25 p-2 mb-3 text-xs text-red-400">{hitoError}</div>
        )}
        {hitoSuccess && (
          <div className="rounded-md bg-green-500/15 border border-green-500/25 p-2 mb-3 text-xs text-green-400">{hitoSuccess}</div>
        )}

        {esCisoOGerente && !esCerrado && (
          <form onSubmit={handleCrearHito} className="mb-4 p-3 rounded-md bg-muted/30 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Nuevo hito</p>
            <input
              type="text"
              value={hitoNombre}
              onChange={(e) => setHitoNombre(e.target.value)}
              placeholder="Nombre del hito"
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
            />
            <textarea
              value={hitoDescripcion}
              onChange={(e) => setHitoDescripcion(e.target.value)}
              placeholder="Descripción (opcional)"
              rows={2}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm resize-none"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={hitoFechaPrevista}
                onChange={(e) => setHitoFechaPrevista(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
              />
              <button
                type="submit"
                disabled={creandoHito}
                className="inline-flex h-8 flex-1 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
              >
                {creandoHito ? "Creando..." : "Crear hito"}
              </button>
            </div>
          </form>
        )}

        {p.hitos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin hitos registrados</p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {p.hitos.map((h) => {
              const dias = diasHastaFecha(h.fechaPrevista)
              const proximo = dias >= 0 && dias <= 3 && !h.completado

              return (
                <div key={h.id} className="rounded-md border bg-muted/10 p-3">
                  {editandoHitoId === h.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editHitoNombre}
                        onChange={(e) => setEditHitoNombre(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm font-medium"
                      />
                      <textarea
                        value={editHitoDescripcion}
                        onChange={(e) => setEditHitoDescripcion(e.target.value)}
                        rows={2}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm resize-none"
                      />
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={editHitoFechaPrevista}
                          onChange={(e) => setEditHitoFechaPrevista(e.target.value)}
                          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                        />
                        <input
                          type="date"
                          value={editHitoFechaReal}
                          onChange={(e) => setEditHitoFechaReal(e.target.value)}
                          placeholder="Fecha real"
                          className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={editHitoCompletado}
                          onChange={(e) => setEditHitoCompletado(e.target.checked)}
                          className="rounded border-border"
                        />
                        Completado
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={handleGuardarHito}
                          disabled={editandoHitoLoading}
                          className="inline-flex h-7 flex-1 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                        >
                          {editandoHitoLoading ? "Guardando..." : "Guardar"}
                        </button>
                        <button
                          onClick={cancelarEdicionHito}
                          className="inline-flex h-7 flex-1 items-center justify-center rounded-md bg-muted px-3 text-xs font-medium hover:bg-muted/80"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${h.completado ? "bg-green-400" : proximo ? "bg-yellow-400" : "bg-muted-foreground"}`} />
                          <span className="text-sm font-medium">{h.nombre}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(h.fechaPrevista).toLocaleDateString("es-AR")}
                        </span>
                      </div>
                      {h.descripcion && (
                        <p className="text-xs text-muted-foreground mb-1 line-clamp-2 ml-4">{h.descripcion}</p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground ml-4">
                        <div className="flex items-center gap-2">
                          {h.completado ? (
                            <span className="text-green-400">Completado{h.fechaReal ? ` ${new Date(h.fechaReal).toLocaleDateString("es-AR")}` : ""}</span>
                          ) : (
                            <>
                              <span className={dias <= 3 && dias >= 0 ? "text-yellow-400" : dias < 0 ? "text-red-400" : ""}>
                                {dias < 0 ? `Vencido hace ${Math.abs(dias)} día(s)` : dias === 0 ? "Hoy" : `En ${dias} día(s)`}
                              </span>
                              {proximo && (
                                <span className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 rounded-full px-2 py-0.5">Próximo</span>
                              )}
                            </>
                          )}
                        </div>
                        {esCisoOGerente && !esCerrado && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => iniciarEdicionHito(h)}
                              className="text-primary hover:underline"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminarHito(h.id)}
                              disabled={eliminandoHitoId === h.id}
                              className="text-red-400 hover:text-red-300 disabled:opacity-50"
                            >
                              {eliminandoHitoId === h.id ? "..." : "✕"}
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-surface-elevated/80 p-6">
        <h3 className="text-lg font-semibold mb-3">Documentos ({p.documentos.length})</h3>

        {docError && (
          <div className="rounded-md bg-red-500/15 border border-red-500/25 p-2 mb-3 text-xs text-red-400">{docError}</div>
        )}
        {docSuccess && (
          <div className="rounded-md bg-green-500/15 border border-green-500/25 p-2 mb-3 text-xs text-green-400">{docSuccess}</div>
        )}

        {(puedeGestionarTareas || sessionRol === "AUDITOR" || sessionRol === "CAPACITADOR") && !esCerrado && (
          <form onSubmit={handleSubirDocumento} className="mb-4 p-3 rounded-md bg-muted/30 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Subir documento</p>
            <input
              type="file"
              onChange={(e) => setDocArchivo(e.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary-hover"
            />
            <select
              value={docTipo}
              onChange={(e) => setDocTipo(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
            >
              {Object.entries(DOC_TIPO_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={docSubiendo}
              className="inline-flex h-8 w-full items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {docSubiendo ? "Subiendo..." : "Subir documento"}
            </button>
          </form>
        )}

        {p.documentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin documentos adjuntos</p>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {p.documentos.map((d) => (
              <div key={d.id} className="rounded-md border bg-muted/10 p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">{d.nombreArchivo}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${DOC_TIPO_BADGES[d.tipo] ?? ""}`}>
                      {DOC_TIPO_LABELS[d.tipo] ?? d.tipo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button
                      onClick={() => setViendoDocId(viendoDocId === d.id ? null : d.id)}
                      className="text-xs text-primary hover:underline"
                    >
                      {viendoDocId === d.id ? "Ocultar" : "Ver"}
                    </button>
                    {(esCisoOGerente || estaAsignado) && !esCerrado && (
                      <button
                        onClick={() => handleEliminarDocumento(d.id)}
                        disabled={eliminandoDocId === d.id}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        {eliminandoDocId === d.id ? "..." : "✕"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                  <span>{formatearTamano(d.url)}</span>
                  <span>{new Date(d.createdAt).toLocaleDateString("es-AR")}</span>
                  {d.tareaId && <span>Vinculado a tarea</span>}
                </div>
                {viendoDocId === d.id && (
                  <div className="mt-3 rounded-md overflow-hidden border border-border/50">
                    {d.url.startsWith("data:image/") ? (
                      <img src={d.url} alt={d.nombreArchivo} className="max-w-full max-h-80 object-contain mx-auto" />
                    ) : d.url.startsWith("data:application/pdf") ? (
                      <iframe src={d.url} className="w-full h-80" title={d.nombreArchivo} />
                    ) : (
                      <div className="p-4 text-center">
                        <a
                          href={d.url}
                          download={d.nombreArchivo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Descargar {d.nombreArchivo}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-surface-elevated/80 p-6">
        <h3 className="text-lg font-semibold mb-3">Historial de estados</h3>
        {p.historialEstados.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin historial</p>
        ) : (
          <div className="space-y-3">
            {p.historialEstados.map((h) => (
              <div key={h.id} className="flex items-start gap-3 text-sm">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <div className="w-px h-full bg-border" />
                </div>
                <div>
                  <p>
                    {h.estadoAnterior ? (
                      <><span className="font-medium">{estadoLabels[h.estadoAnterior] ?? h.estadoAnterior}</span> → <span className="font-medium">{estadoLabels[h.estadoNuevo] ?? h.estadoNuevo}</span></>
                    ) : (
                      <span className="font-medium">Creado en {estadoLabels[h.estadoNuevo] ?? h.estadoNuevo}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.createdAt).toLocaleString("es-AR")}
                    {h.empleado ? ` por ${h.empleado.nombre} ${h.empleado.apellido}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        Creado: {new Date(p.fechaInicio).toLocaleString("es-AR")}
      </div>
    </div>
  )
}
