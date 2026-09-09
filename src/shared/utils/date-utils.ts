export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0]
}

export function isPastDate(dateStr: string): boolean {
  if (!dateStr) return false
  const today = getTodayISO()
  return dateStr < today
}

export function dateToInputValue(date: Date | string | null): string {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  return d.toISOString().split("T")[0]
}
