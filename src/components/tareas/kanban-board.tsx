"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

const COLUMNAS = [
  { id: "PENDIENTE", label: "Pendiente", color: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" },
  { id: "EN_PROGRESO", label: "En Progreso", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  { id: "COMPLETADA", label: "Completada", color: "bg-green-500/15 text-green-600 dark:text-green-400" },
  { id: "CANCELADA", label: "Cancelada", color: "bg-muted text-muted-foreground" },
] as const

const COLUMN_IDS = COLUMNAS.map((c) => c.id) as readonly string[]

const PRIORIDAD_COLORS: Record<string, string> = {
  BAJA: "bg-muted text-muted-foreground",
  MEDIA: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  ALTA: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  CRITICA: "bg-red-500/15 text-red-600 dark:text-red-400",
}

type Tarea = {
  id: string
  titulo: string
  descripcion?: string | null
  estado: string
  prioridad: string
  orden: number
  fechaLimite?: string | null
  asignacion?: { empleado: { nombre: string; apellido: string } } | null
}

type KanbanBoardProps = {
  tareas: Tarea[]
  onMoveTarea: (tareaId: string, nuevoEstado: string, nuevoOrden: number) => void
  onEditTarea?: (tarea: Tarea) => void
  readonly?: boolean
}

function KanbanCard({ tarea, onEdit }: { tarea: Tarea; onEdit?: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tarea.id, data: { tarea } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border bg-surface-elevated/80 p-3 sm:p-4 space-y-2"
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground truncate">{tarea.titulo}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${PRIORIDAD_COLORS[tarea.prioridad] ?? "bg-muted text-muted-foreground"}`}>
              {tarea.prioridad}
            </span>
          </div>
          {tarea.descripcion && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tarea.descripcion}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {tarea.asignacion && (
              <span>{tarea.asignacion.empleado.nombre} {tarea.asignacion.empleado.apellido}</span>
            )}
            {tarea.fechaLimite && (
              <span>{new Date(tarea.fechaLimite).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}</span>
            )}
          </div>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs text-primary hover:underline shrink-0"
          >
            Editar
          </button>
        )}
      </div>
    </div>
  )
}

function KanbanCardOverlay({ tarea }: { tarea: Tarea }) {
  return (
    <div className="rounded-lg border bg-surface-elevated/80 p-3 sm:p-4 space-y-2 shadow-lg w-[280px] opacity-90">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground truncate">{tarea.titulo}</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${PRIORIDAD_COLORS[tarea.prioridad] ?? "bg-muted text-muted-foreground"}`}>
              {tarea.prioridad}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function buildTareasPorColumna(tareasList: Tarea[]): Record<string, Tarea[]> {
  return COLUMNAS.reduce((acc, col) => {
    acc[col.id] = tareasList
      .filter((t) => t.estado === col.id)
      .sort((a, b) => a.orden - b.orden)
    return acc
  }, {} as Record<string, Tarea[]>)
}

function findColumnInState(state: Record<string, Tarea[]>, taskId: string): string | null {
  for (const [estado, tareasCol] of Object.entries(state)) {
    if (tareasCol.some((t) => t.id === taskId)) return estado
  }
  return null
}

function KanbanColumn({
  col,
  tareas,
  onEdit,
  readonly,
}: {
  col: { id: string; label: string; color: string }
  tareas: Tarea[]
  onEdit?: (t: Tarea) => void
  readonly?: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${col.id}` })

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${col.color}`}>
          {col.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {tareas.length}
        </span>
      </div>
      <SortableContext
        items={tareas.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`space-y-2 min-h-[100px] rounded-lg border p-2 transition-colors ${
            isOver
              ? "border-primary bg-primary/5 border-solid"
              : "border-dashed border-border/50"
          }`}
        >
          {tareas.map((t) => (
            <KanbanCard
              key={t.id}
              tarea={t}
              onEdit={readonly ? undefined : () => onEdit?.(t)}
            />
          ))}
          {tareas.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              {isOver ? "Soltar aquí" : "Sin tareas"}
            </p>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export function KanbanBoard({ tareas, onMoveTarea, onEditTarea, readonly }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [tareasPorColumnaLocal, setTareasPorColumnaLocal] = useState(() => buildTareasPorColumna(tareas))

  const stateRef = useRef(tareasPorColumnaLocal)
  stateRef.current = tareasPorColumnaLocal

  const onMoveTareaRef = useRef(onMoveTarea)
  onMoveTareaRef.current = onMoveTarea

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
      disabled: readonly,
    })
  )

  useEffect(() => {
    setTareasPorColumnaLocal(buildTareasPorColumna(tareas))
  }, [tareas])

  const activeTarea = activeId
    ? tareas.find((t) => t.id === activeId)
      ?? Object.values(tareasPorColumnaLocal).flat().find((t) => t.id === activeId)
    : null

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const currentState = stateRef.current

    let overColumn: string | null = findColumnInState(currentState, over.id as string)
    if (!overColumn) {
      const overIdStr = over.id as string
      if (overIdStr.startsWith("column-")) {
        overColumn = overIdStr.replace("column-", "")
      } else if ((COLUMN_IDS as readonly string[]).includes(overIdStr)) {
        overColumn = overIdStr
      }
    }
    if (!overColumn) return

    setTareasPorColumnaLocal((prev) => {
      let movedItem: Tarea | null = null

      let sourceCol = findColumnInState(prev, active.id as string)
      if (sourceCol) {
        const sourceItems = [...prev[sourceCol]]
        const idx = sourceItems.findIndex((t) => t.id === active.id)
        if (idx >= 0) {
          movedItem = sourceItems.splice(idx, 1)[0]
          movedItem.estado = overColumn
          prev = { ...prev, [sourceCol]: sourceItems }
        }
      }

      if (!movedItem) {
        for (const [col, items] of Object.entries(prev)) {
          const idx = items.findIndex((t) => t.id === active.id)
          if (idx >= 0) {
            const copy = [...items]
            movedItem = copy.splice(idx, 1)[0]
            movedItem.estado = overColumn
            prev = { ...prev, [col]: copy }
            sourceCol = col
            break
          }
        }
      }

      if (!movedItem) return prev

      const destItems = [...(prev[overColumn] ?? [])]

      if (sourceCol === overColumn) {
        const overIdx = destItems.findIndex((t) => t.id === over.id)
        if (overIdx >= 0) {
          destItems.splice(overIdx, 0, movedItem)
        } else {
          destItems.push(movedItem)
        }
      } else {
        const existingIdx = destItems.findIndex((t) => t.id === active.id)
        if (existingIdx >= 0) destItems.splice(existingIdx, 1)
        destItems.push(movedItem)
      }

      destItems.forEach((t, i) => {
        onMoveTareaRef.current(t.id, t.estado, i)
      })

      return { ...prev, [overColumn]: destItems }
    })
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const currentState = stateRef.current
    const activeColumn = findColumnInState(currentState, active.id as string)
    if (!activeColumn) return

    let overColumn: string | null = findColumnInState(currentState, over.id as string)
    if (!overColumn) {
      const overIdStr = over.id as string
      if (overIdStr.startsWith("column-")) {
        overColumn = overIdStr.replace("column-", "")
      } else if ((COLUMN_IDS as readonly string[]).includes(overIdStr)) {
        overColumn = overIdStr
      }
    }
    if (!overColumn || activeColumn === overColumn) return

    setTareasPorColumnaLocal((prev) => {
      const sourceItems = [...(prev[activeColumn] ?? [])]
      const destItems = [...(prev[overColumn] ?? [])]

      const activeIndex = sourceItems.findIndex((t) => t.id === active.id)
      if (activeIndex === -1) return prev

      const movedItem = { ...sourceItems[activeIndex], estado: overColumn }
      sourceItems.splice(activeIndex, 1)

      const overIndex = destItems.findIndex((t) => t.id === over.id)
      if (overIndex >= 0) {
        destItems.splice(overIndex, 0, movedItem)
      } else {
        destItems.push(movedItem)
      }

      return { ...prev, [activeColumn]: sourceItems, [overColumn]: destItems }
    })
  }, [])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={readonly ? undefined : handleDragOver}
      onDragEnd={readonly ? undefined : handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNAS.map((col) => (
          <KanbanColumn
            key={col.id}
            col={col}
            tareas={tareasPorColumnaLocal[col.id] ?? []}
            onEdit={onEditTarea}
            readonly={readonly}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTarea ? <KanbanCardOverlay tarea={activeTarea} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
