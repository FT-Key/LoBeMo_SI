const hits = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60_000
const MAX_REQUESTS = 5

export function checkRateLimit(ip: string): { ok: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const entry = hits.get(ip)

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { ok: false, retryAfterMs: entry.resetAt - now }
  }

  entry.count++
  return { ok: true }
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of hits) {
    if (now > entry.resetAt) hits.delete(key)
  }
}, 60_000)
