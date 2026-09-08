import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // US-051: propagar request ID (trace ID) para logging estructurado (RNF-12)
  const requestId =
    request.headers.get("x-request-id") ?? crypto.randomUUID()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-request-id", requestId)

  if (/\.(?:png|jpg|jpeg|gif|webp|svg|ico|avif|css|js|woff2?|json)$/.test(request.nextUrl.pathname)) {
    const staticRes = NextResponse.next({
      request: { headers: requestHeaders },
    })
    staticRes.headers.set("x-request-id", requestId)
    return staticRes
  }
  const isAuthPage = request.nextUrl.pathname.startsWith("/login")
  const isApiAuth = request.nextUrl.pathname.startsWith("/api/auth")
  const isPortalPublic = request.nextUrl.pathname.startsWith("/seguimiento")
  const isPortalApi = request.nextUrl.pathname.startsWith("/api/portal")
  const isSolicitarAcceso = request.nextUrl.pathname.startsWith("/solicitar-acceso")
  const isProyectosAcceso = request.nextUrl.pathname.startsWith("/api/proyectos-acceso")
  const token = request.cookies.get("authjs.session-token")?.value || request.cookies.get("__Secure-authjs.session-token")?.value

  if (isAuthPage || isApiAuth || isPortalPublic || isPortalApi || isSolicitarAcceso || isProyectosAcceso || request.nextUrl.pathname === "/") {
    const res = NextResponse.next({
      request: { headers: requestHeaders },
    })
    res.headers.set("x-request-id", requestId)
    return res
  }

  if (!token && !request.nextUrl.pathname.startsWith("/_next") && !request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  })
  res.headers.set("x-request-id", requestId)
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|avif|css|js|woff2?|json)).*)"],
}
