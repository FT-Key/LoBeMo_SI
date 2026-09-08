import { vi } from "vitest"

vi.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => new Response(JSON.stringify(data), {
      status: init?.status ?? 200,
      headers: { "Content-Type": "application/json", ...init?.headers },
    }),
    redirect: (url: string) => new Response(null, { status: 302, headers: { Location: url } }),
  },
  NextRequest: Request,
}))

vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: vi.fn(),
}))

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}))
