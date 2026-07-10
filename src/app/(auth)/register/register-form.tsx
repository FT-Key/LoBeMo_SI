"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { registerSchema, type RegisterFormData } from "@/shared/validation"

export function RegisterForm() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nombre: "", apellido: "", email: "", password: "" },
  })

  async function onSubmit(data: RegisterFormData) {
    const res = await fetch("/api/empleados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        rol: "GERENTE_GENERAL",
        area: "GERENCIA",
        isInitialSetup: true,
      }),
    })

    if (!res.ok) {
      const json = await res.json()
      setError("root", { message: json.error || "Error al crear el superadmin" })
      return
    }

    router.push("/login")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root?.message && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {errors.root.message}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="nombre" className="text-sm font-medium">Nombre</label>
        <input id="nombre" {...register("nombre")} type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="apellido" className="text-sm font-medium">Apellido</label>
        <input id="apellido" {...register("apellido")} type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.apellido && <p className="text-xs text-destructive">{errors.apellido.message}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input id="email" {...register("email")} type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
        <input id="password" {...register("password")} type="password" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full h-10 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50">
        {isSubmitting ? "Creando..." : "Registrar superadmin"}
      </button>
    </form>
  )
}
