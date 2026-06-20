---
name: security
description: Seguridad en Next.js: autenticacion, proteccion de rutas, validacion, headers, rate limiting, variables de entorno
license: MIT
---

## Autenticacion con NextAuth.js / Auth.js

```typescript
// adapters/in/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as { email: string; password: string }
        const result = await loginUseCase.execute({ email, password })
        if (result.isFail) return null
        return result.unwrap()
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      session.user.id = token.sub!
      return session
    },
  },
})
```

## Middleware de proteccion de rutas

```typescript
// src/middleware.ts
export { auth as middleware } from '@/adapters/in/app/api/auth/[...nextauth]/route'

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/admin/:path*'],
}
```

## Server Actions — validacion siempre

```typescript
'use server'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }

  const result = await registerUseCase.execute(parsed.data)
  if (result.isFail) {
    return { error: { message: result.error.message } }
  }

  return { success: true, user: result.unwrap() }
}
```

## Headers de seguridad

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'",
          },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}
```

## Rate limiting

```typescript
// shared/utils/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
})

export async function rateLimit(identifier: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(identifier)
  if (!success) {
    throw new RateLimitError('Too many requests')
  }
  return { limit, remaining, reset }
}
```

## Variables de entorno — validacion en build time

```typescript
// env.ts
import { z } from 'zod'

const envSchema = z.object({
  MONGODB_URI: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  GITHUB_TOKEN: z.string().optional(),
})

export const env = envSchema.parse(process.env)
```

## Reglas generales

- Nunca exponer errores internos al cliente (usar AppError.toJSON())
- Validar todo input externo con Zod
- CSRF: NextAuth lo maneja automaticamente con tokens JWT
- Passwords: usar bcrypt (hash + salt), nunca almacenar en texto plano
- Secrets: solo en variables de entorno, nunca en el codigo
- CORS: configurar explicitamente en next.config.ts, no abrir a *
