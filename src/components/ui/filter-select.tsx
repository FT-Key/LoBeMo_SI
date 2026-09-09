export type FilterOption = {
  value: string
  label: string
}

export function FilterSelect({
  value,
  onChange,
  options,
  allLabel = "Todos",
  className = "flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm",
}: {
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
  allLabel?: string
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
