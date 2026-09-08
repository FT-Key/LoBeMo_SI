import { describe, it, expect } from "vitest"
import {
  logger,
  getRequestId,
  childLogger,
  getRequestLogger,
  logApiError,
  REQUEST_ID_HEADER,
} from "./logger"

describe("logger (US-051)", () => {
  it("expone los niveles pino", () => {
    for (const level of ["debug", "info", "warn", "error"] as const) {
      expect(typeof logger[level]).toBe("function")
    }
  })

  it("getRequestId extrae el header x-request-id", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { [REQUEST_ID_HEADER]: "req-123" },
    })
    expect(getRequestId(req)).toBe("req-123")
  })

  it("getRequestId devuelve undefined sin request", () => {
    expect(getRequestId()).toBeUndefined()
    const req = new Request("http://localhost/api/test")
    expect(getRequestId(req)).toBeUndefined()
  })

  it("childLogger y getRequestLogger crean loggers sin lanzar", () => {
    expect(() => childLogger({ requestId: "abc", entidad: "Cliente" })).not.toThrow()
    const req = new Request("http://localhost/api/test", {
      headers: { [REQUEST_ID_HEADER]: "req-456" },
    })
    const child = getRequestLogger(req, { entidad: "Proyecto", accion: "CREATE" })
    expect(typeof child.info).toBe("function")
  })

  it("logApiError no lanza con Error real", () => {
    expect(() =>
      logApiError("GET /api/test", new Error("boom"), { entidad: "Test" })
    ).not.toThrow()
    const req = new Request("http://localhost/api/test", {
      headers: { [REQUEST_ID_HEADER]: "req-789" },
    })
    expect(() =>
      logApiError("GET /api/test", new Error("boom"), { request: req })
    ).not.toThrow()
  })
})
