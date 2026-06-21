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

const NOMBRES_SERVICIOS: Record<string, string> = {
  AUDITORIA_ISO27001: "Auditoría ISO 27001",
  PENTESTING: "Pentesting",
  DESARROLLO_SEGURO: "Desarrollo Seguro",
  CONSULTORIA_REDES: "Consultoría en Redes",
  CAPACITACION: "Capacitación",
  SOPORTE_TECNICO: "Soporte Técnico",
}

type ProyectoDetalleProps = {
  proyecto: Record<string, unknown>
  sessionRol: string
  estadoLabels: Record<string, string>
}

export function ProyectoDetalle({ proyecto,   sessionRol, estadoLabels }: ProyectoDetalleProps) {
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
    tareas: Array<{ id: string; titulo: string; estado: string; prioridad: string }>
    hitos: Array<{ id: string; nombre: string; fechaPrevista: string; completado: boolean }>
    historialEstados: Array<{
      id: string
      estadoAnterior: string | null
      estadoNuevo: string
      createdAt: string
      empleado: { id: string; nombre: string; apellido: string } | null
    }>
    _count: { tareas: number; asignaciones: number; propuestas: number; documentos: number }
  }

  const puedeTransicionar = ["GERENTE_GENERAL", "CISO", "ADMINISTRACION", "VENTAS"].includes(sessionRol)
  const esCerrado = p.estado === "CERRADO"

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
          {p.asignaciones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin empleados asignados</p>
          ) : (
            <ul className="space-y-2">
              {p.asignaciones.map((a) => (
                <li key={a.id} className="text-sm flex items-center justify-between">
                  <span>{a.empleado.nombre} {a.empleado.apellido}</span>
                  <span className="text-muted-foreground">{a.rolEnProyecto}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border bg-surface-elevated/80 p-6">
          <h3 className="text-lg font-semibold mb-3">Tareas ({p._count.tareas})</h3>
          {p.tareas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin tareas registradas</p>
          ) : (
            <ul className="space-y-2">
              {p.tareas.slice(0, 5).map((t) => (
                <li key={t.id} className="text-sm flex items-center justify-between">
                  <span>{t.titulo}</span>
                  <span className="text-xs text-muted-foreground">{t.estado}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
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
