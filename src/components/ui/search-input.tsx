import type { KeyboardEvent } from "react"

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[250px]",
  onKeyDown,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      className={className}
    />
  )
}
