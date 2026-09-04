"use client"

import { useState } from "react"
import { Settings, Save, CheckCircle, AlertCircle } from "lucide-react"

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Settings className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Panel de Administración</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Configura los parámetros generales del sistema</p>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            message.type === "success"
              ? "bg-success/10 border-success/20 text-success"
              : "bg-danger/10 border-danger/20 text-danger"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="size-5 shrink-0" />
          ) : (
            <AlertCircle className="size-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Config Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.clave}
            className="group rounded-2xl border border-border bg-surface/50 backdrop-blur-sm p-5 hover:bg-surface/80 transition-all duration-200 hover:shadow-lg hover:shadow-black/10"
          >
            <label htmlFor={item.clave} className="block text-sm font-semibold text-foreground mb-1.5">
              {item.label}
            </label>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{item.descripcion}</p>
            <input
              id={item.clave}
              type="number"
              min="1"
              max="100"
              value={item.valor}
              onChange={(e) => handleChange(item.clave, e.target.value)}
              className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-lg font-semibold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover active:bg-primary-active disabled:opacity-50 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
        >
          <Save className="size-4" />
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </div>
  )
}
