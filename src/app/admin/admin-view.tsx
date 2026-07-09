"use client"

import { useState } from "react"

type ConfigItem = {
  clave: string
  valor: string
  label: string
  descripcion: string
}

export function AdminView({ initialItems }: { initialItems: ConfigItem[] }) {
  const [items, setItems] = useState<ConfigItem[]>(initialItems)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  function handleChange(clave: string, valor: string) {
    setItems((prev) => prev.map((i) => (i.clave === clave ? { ...i, valor } : i)))
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)

    const configuraciones = items.map((i) => ({ clave: i.clave, valor: i.valor }))

    const res = await fetch("/api/configuracion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ configuraciones }),
    })

    if (res.ok) {
      setMessage({ type: "success", text: "Configuración guardada correctamente" })
    } else {
      const json = await res.json()
      setMessage({ type: "error", text: json.error || "Error al guardar configuración" })
    }

    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-destructive/15 text-destructive"
              : "bg-destructive/15 text-destructive"
          }`}
        >
          {message.text}
        </div>
      )}

      {items.map((item) => (
        <div key={item.clave} className="rounded-md border p-4">
          <label htmlFor={item.clave} className="block text-sm font-medium mb-1">
            {item.label}
          </label>
          <p className="text-xs text-muted-foreground mb-3">{item.descripcion}</p>
          <input
            id={item.clave}
            type="number"
            min="1"
            max="100"
            value={item.valor}
            onChange={(e) => handleChange(item.clave, e.target.value)}
            className="flex h-10 w-full sm:w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-foreground px-6 h-10 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar configuración"}
      </button>
    </div>
  )
}
