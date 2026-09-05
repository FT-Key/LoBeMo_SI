"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormData } from "@/shared/validation"
import { loginAction } from "@/app/(auth)/login/actions"

type LoginModalProps = {
  open: boolean
  onClose: () => void
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [redirecting, setRedirecting] = useState(false)
  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm<LoginFormData>({
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
        reset()
        onClose()
        router.push("/dashboard")
      } else {
        setError("root", { message: result.error || "Error al iniciar sesión" })
      }
    })
  }

  function handleClose() {
    if (!isPending && !redirecting) {
      reset()
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border/50 bg-background p-6 shadow-2xl">
        <button
          onClick={handleClose}
          disabled={isPending || redirecting}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold">LoBeMo Seguridad</h2>
          <p className="text-sm text-muted-foreground mt-1">Acceso empleados</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root?.message && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {errors.root.message}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="login-email" className="text-sm font-medium">Email</label>
            <input id="login-email" {...register("email")} type="email" disabled={isPending || redirecting} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="login-password" className="text-sm font-medium">Contraseña</label>
            <input id="login-password" {...register("password")} type="password" disabled={isPending || redirecting} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50" />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isPending || redirecting} className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50">
            {redirecting ? "Redirigiendo..." : isPending ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  )
}
