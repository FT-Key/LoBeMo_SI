"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { loginAction } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50"
    >
      {pending ? "Ingresando..." : "Iniciar sesión"}
    </button>
  )
}

export function LoginForm({ externalError }: { externalError: string | null }) {
  const [state, formAction] = useActionState(loginAction, null)

  useEffect(() => {
    if (state?.success) {
      window.location.href = "/dashboard"
    }
  }, [state])

  const error = state?.error ?? externalError

  return (
    <form action={formAction} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
        <input id="password" name="password" type="password" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <SubmitButton />
    </form>
  )
}
