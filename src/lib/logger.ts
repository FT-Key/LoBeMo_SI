import pino from "pino"

const isDev = process.env.NODE_ENV !== "production"

export const REQUEST_ID_HEADER = "x-request-id"

/**
 * Logger estructurado (US-051 / RNF-12).
 *
 * - Niveles: debug, info, warn, error (vía LOG_LEVEL, default debug en dev / info en prod)
 * - Cada log incluye contexto base: service, env
 * - El trace/request ID se propaga con `getRequestLogger(request)` o `child()`
 * - No usar console.* en código de servidor en producción: usar este logger
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  base: {
    service: "lobemo-si",
    env: process.env.NODE_ENV ?? "development",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

export type LogContext = {
  requestId?: string
  userId?: string
  entidad?: string
  accion?: string
  [key: string]: unknown
}

/** Extrae el request ID propagado por el middleware (header x-request-id). */
export function getRequestId(request?: Request): string | undefined {
  if (!request) return undefined
  try {
    return request.headers.get(REQUEST_ID_HEADER) ?? undefined
  } catch {
    return undefined
  }
}

/** Crea un child logger con contexto (requestId, userId, entidad, acción...). */
export function childLogger(context: LogContext) {
  const { requestId, ...rest } = context
  return logger.child({
    ...(requestId ? { requestId } : {}),
    ...rest,
  })
}

/** Helper para rutas API: child logger con el requestId del Request entrante. */
export function getRequestLogger(request?: Request, extra?: Omit<LogContext, "requestId">) {
  const requestId = getRequestId(request)
  if (!requestId && !extra) return logger
  return childLogger({ ...extra, ...(requestId ? { requestId } : {}) })
}

/**
 * Helper estándar para catch blocks en API routes.
 * Uso: `logApiError("GET /api/clientes", error, { entidad: "Cliente" })`
 * o con request: `logApiError("GET /api/clientes", error, { request })`
 */
export function logApiError(
  route: string,
  error: unknown,
  context?: LogContext & { request?: Request }
) {
  const { request, ...rest } = context ?? {}
  const requestId = getRequestId(request)
  logger.error(
    {
      err: error,
      route,
      ...(requestId ? { requestId } : {}),
      ...rest,
    },
    route
  )
}
