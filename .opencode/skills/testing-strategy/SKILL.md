---
name: testing-strategy
description: Estrategia de testing para arquitectura hexagonal en Next.js: unit, integration, e2e. Piramide de tests y diagnostico de fallos
license: MIT
---

## Piramide de tests para Hexagonal Architecture

```
    ╱╲
   ╱ E2E ╲           → Playwright (flujos criticos: auth, checkout)
  ╱────────╲
 ╱ Integration ╲     → Supertest + MongoDB Memory Server (API routes)
╱────────────────╲
╱    Unit Tests     ╲  → Vitest (domain + use cases)
╱────────────────────╲
```

## Unit Tests — mayoria del codigo

### Dominio (core/domain/) — tests mas importantes
- Entities: creacion, validacion, metodos de negocio
- Value Objects: creacion, igualdad, formato, casos invalidos
- Errores: tipos, mensajes, herencia
- NO mockear nada — el dominio es puro

```typescript
// tests/unit/core/domain/value-objects/Email.test.ts
it('should reject invalid email', () => {
  expect(() => Email.create('not-an-email')).toThrow(InvalidEmailError)
})

it('should normalize to lowercase', () => {
  expect(Email.create('Test@Example.com').value()).toBe('test@example.com')
})
```

### Use Cases (core/use-cases/)
- Probar cada escenario: exito, error, edge cases
- Mockear SOLO los puertos (interfaces)

```typescript
const mockRepo = {
  save: vi.fn(),
  exists: vi.fn(),
} satisfies IUserRepository

const useCase = new RegisterUserUseCase(mockRepo, mockEmailService)

it('should register a new user', async () => {
  mockRepo.exists.mockResolvedValue(false)
  mockRepo.save.mockResolvedValue(createUser())

  const result = await useCase.execute(validDTO)

  expect(result.isOk).toBe(true)
  expect(mockRepo.save).toHaveBeenCalledOnce()
})
```

## Integration Tests — API layer

- Usar MongoDB Memory Server para base de datos en memoria
- Supertest para llamar a route handlers
- Probar el flujo completo: request → validacion → use case → repositorio → response

```typescript
it('POST /api/auth/register should return 201', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'test@test.com', password: 'ValidPass1!' })

  expect(res.status).toBe(201)
  expect(res.body.success).toBe(true)
  expect(res.body.data.user.email).toBe('test@test.com')
})
```

## E2E Tests — minoria

- Playwright para flujos criticos (registro, login, compra)
- Tests enfocados en UX, no en logica de negocio

## Diagnostico de fallos

Cuando un test falla, clasificar como:

### MISSING_BEHAVIOR
El codigo no implementa lo que el test espera.
- Causa: implementacion incompleta o incorrecta
- Accion: corregir el codigo de produccion

### TEST_BROKEN
El test esta mal, desactualizado o el entorno falla.
- Causa: test mal escrito, dependencia cambiada, config erronea
- Accion: corregir el test o la configuracion

## Comandos

```bash
npm run test              # unit tests
npm run test:integration   # integration tests
npm run test:e2e          # e2e (playwright)
npm run test:coverage     # con reporte de cobertura
```
