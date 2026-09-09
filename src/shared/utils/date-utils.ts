const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0]
}

export function getMinDateForInput(): string {
  return getTodayISO()
}

export function isValidDateFormat(dateStr: string): boolean {
  if (!dateStr) return false
  if (!DATE_REGEX.test(dateStr)) return false
  const d = new Date(dateStr)
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr
}

export function isPastDate(dateStr: string): boolean {
  if (!dateStr) return false
  const today = getTodayISO()
  return dateStr < today
}

export function isDateBefore(dateStr: string, referenceDate: string): boolean {
  if (!dateStr || !referenceDate) return false
  return dateStr < referenceDate
}

export function dateToInputValue(date: Date | string | null): string {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  return d.toISOString().split("T")[0]
}
