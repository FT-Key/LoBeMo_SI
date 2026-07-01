"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const ESTADO_BADGES: Record<string, string> = {
  PLANIFICADA: "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  EN_CURSO: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
  COMPLETADA: "bg-green-500/15 text-green-400 border border-green-500/25",
  CANCELADA: "bg-red-500/15 text-red-400 border border-red-500/25",
}

const ESTADO_LABELS: Record<string, string> = {
  PLANIFICADA: "Planificada",
  EN_CURSO: "En curso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
}

type Certificado = {
  id: string
  codigoCertificado: string
  fechaEmision: string
}

type Asistente = {
  id: string
  nombreAsistente: string
  emailAsistente: string
  organizacion: string | null
  evaluacion: number | null
  completado: boolean
  certificado: Certificado | null
}

type Capacitacion = {
  id: string
  titulo: string
  temario: string
  duracionHoras: number
  modalidad: string
  fechaInicio: string
  fechaFin: string | null
  estado: string
  materiales: string | null
  proyecto: { id: string; nombre: string; estado: string } | null
  asistentes: Asistente[]
}

export function CapacitacionDetalle({
  capacitacion: initialData,
  sessionRol,
  sessionUserId,
}: {
  capacitacion: Capacitacion
  sessionRol: string
  sessionUserId: string
}) {
  const router = useRouter()
  const [capacitacion, setCapacitacion] = useState<Capacitacion>(initialData)
  const [editando, setEditando] = useState(false)
  const [editGeneral, setEditGeneral] = useState({
    titulo: initialData.titulo,
    temario: initialData.temario,
    duracionHoras: String(initialData.duracionHoras),
    modalidad: initialData.modalidad,
    fechaInicio: initialData.fechaInicio.slice(0, 10),
    fechaFin: initialData.fechaFin ? initialData.fechaFin.slice(0, 10) : "",
    materiales: initialData.materiales ?? "",
    estado: initialData.estado,
  })
  const [nuevoAsistente, setNuevoAsistente] = useState({ nombre: "", email: "", organizacion: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const esCapacitadorOGerente = sessionRol === "CAPACITADOR" || sessionRol === "GERENTE_GENERAL"

  const TRANSICIONES: Record<string, string[]> = {
    PLANIFICADA: ["EN_CURSO", "CANCELADA"],
    EN_CURSO: ["COMPLETADA", "CANCELADA"],
    COMPLETADA: [],
    CANCELADA: [],
  }

  async function guardarCambios() {
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`/api/capacitaciones/${capacitacion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editGeneral),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al guardar")
        setLoading(false)
        return
      }

      const actualizada = await res.json()
      setCapacitacion(actualizada)
      setEditando(false)
      router.refresh()
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  async function handleTransicion(estado: string) {
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`/api/capacitaciones/${capacitacion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al cambiar estado")
        setLoading(false)
        return
      }

      const actualizada = await res.json()
      setCapacitacion(actualizada)
      router.refresh()
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  async function agregarAsistente(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!nuevoAsistente.nombre.trim() || !nuevoAsistente.email.trim()) {
      setError("Nombre y email son obligatorios")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/capacitaciones/${capacitacion.id}/asistentes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoAsistente),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al registrar asistente")
        setLoading(false)
        return
      }

      const asistente = await res.json()
      setCapacitacion((prev) => ({
        ...prev,
        asistentes: [...prev.asistentes, asistente],
      }))
      setNuevoAsistente({ nombre: "", email: "", organizacion: "" })
      router.refresh()
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  async function actualizarAsistente(asisId: string, data: Record<string, unknown>) {
    setError("")
    try {
      const res = await fetch(`/api/capacitaciones/${capacitacion.id}/asistentes/${asisId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al actualizar asistente")
        return
      }

      const actualizado = await res.json()
      setCapacitacion((prev) => ({
        ...prev,
        asistentes: prev.asistentes.map((a) => (a.id === asisId ? actualizado : a)),
      }))
    } catch {
      setError("Error de conexión")
    }
  }

  async function eliminarAsistente(asisId: string) {
    if (!confirm("¿Eliminar este asistente?")) return

    const anterior = capacitacion.asistentes

    setCapacitacion((prev) => ({
      ...prev,
      asistentes: prev.asistentes.filter((a) => a.id !== asisId),
    }))

    const res = await fetch(`/api/capacitaciones/${capacitacion.id}/asistentes/${asisId}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      setCapacitacion((prev) => ({ ...prev, asistentes: anterior }))
      const err = await res.json()
      setError(err.error || "Error al eliminar asistente")
    }
  }

  async function generarCertificado(asistenteId: string) {
    setError("")
    try {
      const res = await fetch(`/api/capacitaciones/${capacitacion.id}/certificado`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asistenteId }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al generar certificado")
        return
      }

      const certificado = await res.json()
      setCapacitacion((prev) => ({
        ...prev,
        asistentes: prev.asistentes.map((a) =>
          a.id === asistenteId ? { ...a, certificado } : a
        ),
      }))
    } catch {
      setError("Error de conexión")
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-3 rounded-md bg-red-500/15 text-red-400 border border-red-500/25 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{capacitacion.titulo}</h2>
          <p className="text-sm text-muted-foreground">
            {capacitacion.proyecto && `Proyecto: ${capacitacion.proyecto.nombre} | `}
            Modalidad: {capacitacion.modalidad === "PRESENCIAL" ? "Presencial" : "Remota"} |
            Duración: {capacitacion.duracionHoras}h |
            Estado: {ESTADO_LABELS[capacitacion.estado]}
          </p>
        </div>
        <div className="flex gap-2">
          {esCapacitadorOGerente && !editando && (
            <button
              onClick={() => setEditando(true)}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-muted"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      {editando && (
        <div className="rounded-md border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Editar capacitación</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">Título</label>
            <input
              value={editGeneral.titulo}
              onChange={(e) => setEditGeneral((p) => ({ ...p, titulo: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Temario</label>
            <textarea
              value={editGeneral.temario}
              onChange={(e) => setEditGeneral((p) => ({ ...p, temario: e.target.value }))}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Duración (horas)</label>
              <input
                type="number"
                min="1"
                value={editGeneral.duracionHoras}
                onChange={(e) => setEditGeneral((p) => ({ ...p, duracionHoras: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Modalidad</label>
              <select
                value={editGeneral.modalidad}
                onChange={(e) => setEditGeneral((p) => ({ ...p, modalidad: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="PRESENCIAL">Presencial</option>
                <option value="REMOTA">Remota</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de inicio</label>
              <input
                type="date"
                value={editGeneral.fechaInicio}
                onChange={(e) => setEditGeneral((p) => ({ ...p, fechaInicio: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de finalización</label>
              <input
                type="date"
                value={editGeneral.fechaFin}
                onChange={(e) => setEditGeneral((p) => ({ ...p, fechaFin: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Materiales</label>
            <textarea
              value={editGeneral.materiales}
              onChange={(e) => setEditGeneral((p) => ({ ...p, materiales: e.target.value }))}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={guardarCambios}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              onClick={() => {
                setEditando(false)
                setEditGeneral({
                  titulo: capacitacion.titulo,
                  temario: capacitacion.temario,
                  duracionHoras: String(capacitacion.duracionHoras),
                  modalidad: capacitacion.modalidad,
                  fechaInicio: capacitacion.fechaInicio.slice(0, 10),
                  fechaFin: capacitacion.fechaFin ? capacitacion.fechaFin.slice(0, 10) : "",
                  materiales: capacitacion.materiales ?? "",
                  estado: capacitacion.estado,
                })
              }}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Temario</h3>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{capacitacion.temario}</p>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Materiales</h3>
        {capacitacion.materiales ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{capacitacion.materiales}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Sin materiales registrados</p>
        )}
      </section>

      {esCapacitadorOGerente && TRANSICIONES[capacitacion.estado]?.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Cambiar estado</h3>
          <div className="flex gap-2">
            {TRANSICIONES[capacitacion.estado].map((est) => (
              <button
                key={est}
                onClick={() => handleTransicion(est)}
                disabled={loading}
                className={`inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium disabled:opacity-50 ${
                  est === "CANCELADA"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : est === "COMPLETADA"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                {ESTADO_LABELS[est] ?? est}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Asistentes ({capacitacion.asistentes.length})</h3>

        {esCapacitadorOGerente && (
          <form onSubmit={agregarAsistente} className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium">Nombre *</label>
              <input
                value={nuevoAsistente.nombre}
                onChange={(e) => setNuevoAsistente((p) => ({ ...p, nombre: e.target.value }))}
                className="flex h-9 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Nombre del asistente"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Email *</label>
              <input
                type="email"
                value={nuevoAsistente.email}
                onChange={(e) => setNuevoAsistente((p) => ({ ...p, email: e.target.value }))}
                className="flex h-9 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="email@ejemplo.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Organización</label>
              <input
                value={nuevoAsistente.organizacion}
                onChange={(e) => setNuevoAsistente((p) => ({ ...p, organizacion: e.target.value }))}
                className="flex h-9 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Empresa del asistente"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
            >
              Agregar
            </button>
          </form>
        )}

        {capacitacion.asistentes.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay asistentes registrados</p>
        )}

        <div className="space-y-3">
          {capacitacion.asistentes.map((asis) => (
            <div key={asis.id} className="rounded-md border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{asis.nombreAsistente}</span>
                    {asis.completado && (
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/25">
                        Completado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{asis.emailAsistente}</p>
                  {asis.organizacion && (
                    <p className="text-xs text-muted-foreground">{asis.organizacion}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {asis.evaluacion && (
                    <span className="text-sm font-medium">{asis.evaluacion}/10</span>
                  )}
                  {esCapacitadorOGerente && (
                    <button
                      onClick={() => eliminarAsistente(asis.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>

              {esCapacitadorOGerente && (
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Evaluación (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={asis.evaluacion ?? ""}
                      onBlur={(e) => actualizarAsistente(asis.id, { evaluacion: e.target.value ? parseInt(e.target.value) : null })}
                      className="flex h-8 w-20 rounded-md border border-input bg-background px-2 py-1 text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={asis.completado}
                      onChange={(e) => actualizarAsistente(asis.id, { completado: e.target.checked })}
                      className="rounded border-input"
                    />
                    <span className="text-xs font-medium">Completado</span>
                  </label>
                  {asis.completado && !asis.certificado && (
                    <button
                      onClick={() => generarCertificado(asis.id)}
                      className="inline-flex h-8 items-center justify-center rounded-md bg-green-600 px-3 text-xs font-medium text-white hover:bg-green-700"
                    >
                      Generar certificado
                    </button>
                  )}
                </div>
              )}

              {asis.certificado && (
                <div className="rounded-md bg-green-500/10 border border-green-500/25 p-3">
                  <p className="text-xs font-medium text-green-400">
                    Certificado: {asis.certificado.codigoCertificado}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Emitido: {new Date(asis.certificado.fechaEmision).toLocaleDateString("es-AR")}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {esCapacitadorOGerente && capacitacion.estado !== "COMPLETADA" && (
        <button
          onClick={async () => {
            if (!confirm("¿Eliminar esta capacitación?")) return
            const res = await fetch(`/api/capacitaciones/${capacitacion.id}`, { method: "DELETE" })
            if (res.ok) router.push("/capacitaciones")
          }}
          className="text-sm text-red-400 hover:text-red-300"
        >
          Eliminar capacitación
        </button>
      )}
    </div>
  )
}
