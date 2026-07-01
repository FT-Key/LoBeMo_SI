"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Hallazgo = { titulo: string; descripcion: string; severidad: string; evidencia?: string }
type NoConformidad = { descripcion: string; clasificacion: string; accionCorrectiva?: string }

type InformeAuditoria = {
  id: string
  alcance: string
  criteriosAuditoria: string
  hallazgos: Hallazgo[]
  noConformidades: NoConformidad[]
  observaciones: string[]
  recomendaciones: string[]
  estado: string
  fechaEmision: string | null
  proyecto: { id: string; nombre: string; estado: string; cliente: { id: string; razonSocial: string } }
  creador: { id: string; nombre: string; apellido: string; rol: string }
}

export function InformeAuditoriaDetalle({
  informe: initialInforme,
  sessionRol,
  sessionUserId,
}: {
  informe: InformeAuditoria
  sessionRol: string
  sessionUserId: string
}) {
  const router = useRouter()
  const [informe, setInforme] = useState<InformeAuditoria>(initialInforme)
  const [editando, setEditando] = useState(false)
  const [alcance, setAlcance] = useState(informe.alcance)
  const [criteriosAuditoria, setCriteriosAuditoria] = useState(informe.criteriosAuditoria)
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>(informe.hallazgos || [])
  const [noConformidades, setNoConformidades] = useState<NoConformidad[]>(informe.noConformidades || [])
  const [observaciones, setObservaciones] = useState<string[]>(informe.observaciones || [])
  const [recomendaciones, setRecomendaciones] = useState<string[]>(informe.recomendaciones || [])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const esCreador = informe.creador.id === sessionUserId
  const esGerenteOCiso = sessionRol === "GERENTE_GENERAL" || sessionRol === "CISO"
  const puedeEditar = (esCreador || esGerenteOCiso) && informe.estado !== "COMPLETADO"
  const puedeCompletar = puedeEditar && informe.estado === "BORRADOR"

  function agregarHallazgo() {
    setHallazgos([...hallazgos, { titulo: "", descripcion: "", severidad: "MEDIA", evidencia: "" }])
  }

  function actualizarHallazgo(idx: number, campo: keyof Hallazgo, valor: string) {
    const nuevos = [...hallazgos]
    nuevos[idx] = { ...nuevos[idx], [campo]: valor }
    setHallazgos(nuevos)
  }

  function eliminarHallazgo(idx: number) {
    setHallazgos(hallazgos.filter((_, i) => i !== idx))
  }

  function agregarNoConformidad() {
    setNoConformidades([...noConformidades, { descripcion: "", clasificacion: "MENOR", accionCorrectiva: "" }])
  }

  function actualizarNoConformidad(idx: number, campo: keyof NoConformidad, valor: string) {
    const nuevos = [...noConformidades]
    nuevos[idx] = { ...nuevos[idx], [campo]: valor }
    setNoConformidades(nuevos)
  }

  function eliminarNoConformidad(idx: number) {
    setNoConformidades(noConformidades.filter((_, i) => i !== idx))
  }

  function agregarItem(lista: string[], setter: (l: string[]) => void) {
    setter([...lista, ""])
  }

  function actualizarItem(lista: string[], setter: (l: string[]) => void, idx: number, valor: string) {
    const nuevos = [...lista]
    nuevos[idx] = valor
    setter(nuevos)
  }

  function eliminarItem(lista: string[], setter: (l: string[]) => void, idx: number) {
    setter(lista.filter((_, i) => i !== idx))
  }

  async function guardarCambios(completar = false) {
    setError("")
    setLoading(true)

    const body: Record<string, unknown> = {
      alcance: alcance.trim(),
      criteriosAuditoria: criteriosAuditoria.trim(),
      hallazgos,
      noConformidades,
      observaciones: observaciones.filter((o) => o.trim()),
      recomendaciones: recomendaciones.filter((r) => r.trim()),
    }
    if (completar) body.estado = "COMPLETADO"

    try {
      const res = await fetch(`/api/informes-auditoria/${informe.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al guardar")
        setLoading(false)
        return
      }

      const actualizado = await res.json()
      setInforme(actualizado)
      setEditando(false)
      router.refresh()
    } catch {
      setError("Error de conexión")
      setLoading(false)
    }
  }

  function SeveridadBadge({ severidad }: { severidad: string }) {
    const colores: Record<string, string> = {
      CRITICA: "bg-red-500/15 text-red-400 border border-red-500/25",
      ALTA: "bg-orange-500/15 text-orange-400 border border-orange-500/25",
      MEDIA: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25",
      BAJA: "bg-green-500/15 text-green-400 border border-green-500/25",
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${colores[severidad] ?? ""}`}>
        {severidad}
      </span>
    )
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
          <h2 className="text-2xl font-bold">{informe.proyecto.nombre}</h2>
          <p className="text-sm text-muted-foreground">
            Cliente: {informe.proyecto.cliente.razonSocial} | 
            Creador: {informe.creador.nombre} {informe.creador.apellido} ({informe.creador.rol}) |
            Estado: {informe.estado === "BORRADOR" ? "Borrador" : "Completado"}
            {informe.fechaEmision && ` | Emitido: ${new Date(informe.fechaEmision).toLocaleDateString("es-AR")}`}
          </p>
        </div>
        <div className="flex gap-2">
          {puedeEditar && !editando && (
            <button
              onClick={() => setEditando(true)}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-muted"
            >
              Editar
            </button>
          )}
          {puedeCompletar && !editando && (
            <button
              onClick={() => guardarCambios(true)}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Completando..." : "Completar informe"}
            </button>
          )}
          {editando && (
            <>
              <button
                onClick={() => guardarCambios(false)}
                disabled={loading}
                className="inline-flex h-9 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar borrador"}
              </button>
              <button
                onClick={() => guardarCambios(true)}
                disabled={loading}
                className="inline-flex h-9 items-center justify-center rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Completando..." : "Guardar y completar"}
              </button>
              <button
                onClick={() => { setEditando(false); setAlcance(informe.alcance); setCriteriosAuditoria(informe.criteriosAuditoria); setHallazgos(informe.hallazgos || []); setNoConformidades(informe.noConformidades || []); setObservaciones(informe.observaciones || []); setRecomendaciones(informe.recomendaciones || []) }}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input px-4 text-sm font-medium hover:bg-muted"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Alcance</h3>
        {editando ? (
          <textarea
            value={alcance}
            onChange={(e) => setAlcance(e.target.value)}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
          />
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{informe.alcance}</p>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Criterios de Auditoría</h3>
        {editando ? (
          <textarea
            value={criteriosAuditoria}
            onChange={(e) => setCriteriosAuditoria(e.target.value)}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
          />
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{informe.criteriosAuditoria}</p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Hallazgos</h3>
          {editando && (
            <button
              onClick={agregarHallazgo}
              className="text-sm text-primary hover:underline"
            >
              + Agregar hallazgo
            </button>
          )}
        </div>
        {hallazgos.length === 0 && !editando && (
          <p className="text-sm text-muted-foreground">Sin hallazgos registrados</p>
        )}
        {hallazgos.map((h, i) => (
          <div key={i} className="rounded-md border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {editando ? (
                  <>
                    <input
                      type="text"
                      value={h.titulo}
                      onChange={(e) => actualizarHallazgo(i, "titulo", e.target.value)}
                      placeholder="Título del hallazgo"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                    <textarea
                      value={h.descripcion}
                      onChange={(e) => actualizarHallazgo(i, "descripcion", e.target.value)}
                      placeholder="Descripción"
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                    />
                    <select
                      value={h.severidad}
                      onChange={(e) => actualizarHallazgo(i, "severidad", e.target.value)}
                      className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="BAJA">Baja</option>
                      <option value="MEDIA">Media</option>
                      <option value="ALTA">Alta</option>
                      <option value="CRITICA">Crítica</option>
                    </select>
                    <input
                      type="text"
                      value={h.evidencia || ""}
                      onChange={(e) => actualizarHallazgo(i, "evidencia", e.target.value)}
                      placeholder="Evidencia (opcional)"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{h.titulo}</h4>
                      <SeveridadBadge severidad={h.severidad} />
                    </div>
                    <p className="text-sm text-muted-foreground">{h.descripcion}</p>
                    {h.evidencia && (
                      <p className="text-xs text-muted-foreground">Evidencia: {h.evidencia}</p>
                    )}
                  </>
                )}
              </div>
              {editando && (
                <button
                  onClick={() => eliminarHallazgo(i)}
                  className="text-sm text-red-400 hover:text-red-300 ml-2"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">No Conformidades</h3>
          {editando && (
            <button
              onClick={agregarNoConformidad}
              className="text-sm text-primary hover:underline"
            >
              + Agregar no conformidad
            </button>
          )}
        </div>
        {noConformidades.length === 0 && !editando && (
          <p className="text-sm text-muted-foreground">Sin no conformidades registradas</p>
        )}
        {noConformidades.map((nc, i) => (
          <div key={i} className="rounded-md border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {editando ? (
                  <>
                    <textarea
                      value={nc.descripcion}
                      onChange={(e) => actualizarNoConformidad(i, "descripcion", e.target.value)}
                      placeholder="Descripción de la no conformidad"
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                    />
                    <select
                      value={nc.clasificacion}
                      onChange={(e) => actualizarNoConformidad(i, "clasificacion", e.target.value)}
                      className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="MENOR">Menor</option>
                      <option value="MAYOR">Mayor</option>
                      <option value="CRITICA">Crítica</option>
                    </select>
                    <textarea
                      value={nc.accionCorrectiva || ""}
                      onChange={(e) => actualizarNoConformidad(i, "accionCorrectiva", e.target.value)}
                      placeholder="Acción correctiva (opcional)"
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${nc.clasificacion === "CRITICA" ? "bg-red-500/15 text-red-400" : nc.clasificacion === "MAYOR" ? "bg-orange-500/15 text-orange-400" : "bg-yellow-500/15 text-yellow-400"} border`}>
                        {nc.clasificacion}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{nc.descripcion}</p>
                    {nc.accionCorrectiva && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Acción correctiva:</p>
                        <p className="text-sm text-muted-foreground">{nc.accionCorrectiva}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              {editando && (
                <button
                  onClick={() => eliminarNoConformidad(i)}
                  className="text-sm text-red-400 hover:text-red-300 ml-2"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Observaciones</h3>
          {editando && (
            <button
              onClick={() => agregarItem(observaciones, setObservaciones)}
              className="text-sm text-primary hover:underline"
            >
              + Agregar observación
            </button>
          )}
        </div>
        {observaciones.length === 0 && !editando && (
          <p className="text-sm text-muted-foreground">Sin observaciones registradas</p>
        )}
        <ul className="space-y-2">
          {observaciones.map((obs, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-sm text-muted-foreground mt-0.5">•</span>
              {editando ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={obs}
                    onChange={(e) => actualizarItem(observaciones, setObservaciones, i, e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => eliminarItem(observaciones, setObservaciones, i)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">{obs}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recomendaciones</h3>
          {editando && (
            <button
              onClick={() => agregarItem(recomendaciones, setRecomendaciones)}
              className="text-sm text-primary hover:underline"
            >
              + Agregar recomendación
            </button>
          )}
        </div>
        {recomendaciones.length === 0 && !editando && (
          <p className="text-sm text-muted-foreground">Sin recomendaciones registradas</p>
        )}
        <ul className="space-y-2">
          {recomendaciones.map((rec, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-sm text-muted-foreground mt-0.5">•</span>
              {editando ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={rec}
                    onChange={(e) => actualizarItem(recomendaciones, setRecomendaciones, i, e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => eliminarItem(recomendaciones, setRecomendaciones, i)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">{rec}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {puedeEditar && !editando && (
        <button
          onClick={async () => {
            if (!confirm("¿Eliminar este informe?")) return
            const res = await fetch(`/api/informes-auditoria/${informe.id}`, { method: "DELETE" })
            if (res.ok) router.push("/informes-auditoria")
          }}
          className="text-sm text-red-400 hover:text-red-300"
        >
          Eliminar informe
        </button>
      )}
    </div>
  )
}
