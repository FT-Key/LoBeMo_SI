"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { loginSchema, type LoginFormData } from "@/shared/validation"
import { loginAction } from "./actions"
import { useTransition, useState } from "react"

export function LoginForm({ externalError }: { externalError: string | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [redirecting, setRedirecting] = useState(false)
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginFormData) {
    const formData = new FormData()
    formData.set("email", data.email)
    formData.set("password", data.password)
    startTransition(async () => {
      const result = await loginAction(null, formData)
      if (result.success) {
        setRedirecting(true)
        router.push("/dashboard")
      } else {
        setError("root", { message: result.error || "Error al iniciar sesión" })
      }
    })
  }

  const disabled = isPending || redirecting
  const displayError = errors.root?.message ?? externalError

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {displayError && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {displayError}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input id="email" {...register("email")} type="email" disabled={disabled} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50" />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
        <input id="password" {...register("password")} type="password" disabled={disabled} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50" />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <button type="submit" disabled={disabled} className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50">
        {redirecting ? "Redirigiendo..." : isPending ? "Ingresando..." : "Iniciar sesión"}
      </button>
    </form>
  )
}
