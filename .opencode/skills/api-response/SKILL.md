---
name: api-response
description: Formato unificado de respuestas API. Estandar para exito, error, paginacion. Consistencia en todos los endpoints
license: MIT
---

## Formato unificado de respuesta

### Exito
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-06-13T12:00:00.000Z"
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Invalid email format: test@",
    "details": { "email": "test@" }
  },
  "meta": {
    "timestamp": "2026-06-13T12:00:00.000Z"
  }
}
```

### Paginacion
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true,
    "timestamp": "2026-06-13T12:00:00.000Z"
  }
}
```

## Helpers

```typescript
// shared/utils/api-response.ts

export interface ApiResponseMeta {
  timestamp: string
  page?: number
  pageSize?: number
  total?: number
  totalPages?: number
  hasMore?: boolean
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta: ApiResponseMeta
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  meta: ApiResponseMeta
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export function apiSuccess<T>(data: T, meta?: Partial<ApiResponseMeta>): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta: { timestamp: new Date().toISOString(), ...meta },
  }
}

export function apiError(
  code: string,
  message: string,
  details?: unknown
): ApiErrorResponse {
  return {
    success: false,
    error: { code, message, details },
    meta: { timestamp: new Date().toISOString() },
  }
}

export function apiPaginated<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): ApiSuccessResponse<T[]> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    },
  }
}
```

## Uso en route handlers

```typescript
// adapters/in/app/api/auth/register/route.ts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const dto = registerSchema.parse(body)
    const result = await registerUseCase.execute(dto)

    if (result.isFail) {
      return NextResponse.json(
        apiError(result.error.code, result.error.message, result.error.details),
        { status: result.error.httpStatus }
      )
    }

    return NextResponse.json(
      apiSuccess({ user: result.unwrap() }),
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

## Codigos HTTP

| Codigo | Uso |
|--------|-----|
| 200 | GET exito, PUT/PATCH exito |
| 201 | POST creacion exitosa |
| 204 | DELETE exitoso (sin body) |
| 400 | DomainError, validacion Zod |
| 401 | No autenticado |
| 403 | No autorizado (rol) |
| 404 | Recurso no encontrado |
| 409 | Conflicto (email ya existe) |
| 422 | Error de validacion de negocio |
| 429 | Rate limit |
| 500 | Error interno no esperado |
