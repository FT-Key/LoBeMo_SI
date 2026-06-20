---
name: forms-validation
description: Formularios con react-hook-form, shadcn/ui y Zod. Validacion compartida cliente-servidor, mensajes de error, file upload
license: MIT
---

## Schema compartido (cliente + servidor)

```typescript
// shared/validation/auth.ts
import { z } from 'zod'

export const registerFormSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(50),
  email: z.string().email('Email invalido'),
  password: z
    .string()
    .min(8, 'Password debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener una mayuscula')
    .regex(/[a-z]/, 'Debe contener una minuscula')
    .regex(/[0-9]/, 'Debe contener un numero'),
})

export type RegisterFormData = z.infer<typeof registerFormSchema>
```

## Componente de formulario (cliente)

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  registerFormSchema,
  type RegisterFormData,
} from '@/shared/validation/auth'

export function RegisterForm() {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  async function onSubmit(data: RegisterFormData) {
    const result = await registerAction(data)
    if (result?.error) {
      form.setError('root', { message: result.error.message })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Enviando...' : 'Registrarse'}
        </Button>
      </form>
    </Form>
  )
}
```

## Server Action con mismo schema

```typescript
'use server'

import { registerFormSchema } from '@/shared/validation/auth'
import { container } from '@/adapters/di/container'

export async function registerAction(formData: RegisterFormData) {
  const parsed = registerFormSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: { message: 'Datos invalidos', details: parsed.error.flatten() } }
  }

  const useCase = container.resolve(RegisterUserUseCase)
  const result = await useCase.execute(parsed.data)

  if (result.isFail) {
    return { error: { message: result.error.message } }
  }

  return { success: true }
}
```

## File upload con validacion

```typescript
// shared/validation/media.ts
export const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, 'Max 5MB')
    .refine(
      (f) => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type),
      'Solo imagenes JPEG, PNG o WebP'
    ),
})

// Uso en Server Action
export async function uploadAction(formData: FormData) {
  const file = formData.get('file') as File
  const parsed = uploadSchema.safeParse({ file })
  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }
  // procesar archivo...
}
```

## Reglas

- Los schemas Zod viven en `shared/validation/` para reutilizarse
- El cliente valida antes de enviar (UX)
- El servidor valida SIEMPRE aunque el cliente ya lo haya hecho (seguridad)
- Usar `safeParse()` en lugar de `parse()` para manejar errores gracefulmente
- Los mensajes de error deben ser claros para el usuario final
- Los formularios complejos (> 5 campos) dividir en steps o secciones
- Deshabilitar submit mientras se envia, mostrar loading state
