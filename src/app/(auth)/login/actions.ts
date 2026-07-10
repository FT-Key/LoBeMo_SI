"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { encode } from "@auth/core/jwt"

export async function loginAction(
  _prevState: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("[loginAction] email:", email)

  if (!email || !password) {
    console.log("[loginAction] missing fields")
    return { error: "Email y contraseña son requeridos" }
  }

  const empleado = await prisma.empleado.findUnique({ where: { email } })
  if (!empleado || !empleado.activo) {
    console.log("[loginAction] user not found or inactive")
    return { error: "Email o contraseña incorrectos" }
  }

  const isValid = await bcrypt.compare(password, empleado.password)
  if (!isValid) {
    console.log("[loginAction] invalid password")
    return { error: "Email o contraseña incorrectos" }
  }

  console.log("[loginAction] password valid, creating session token")

  const token = {
    sub: empleado.id,
    rol: empleado.rol,
    email: empleado.email,
    name: `${empleado.nombre} ${empleado.apellido}`,
    picture: null,
  }

  const secure = process.env.AUTH_URL?.startsWith("https://") ?? process.env.NODE_ENV === "production"
  const cookieName = secure ? "__Secure-authjs.session-token" : "authjs.session-token"

  const encodedToken = await encode({
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "",
    salt: cookieName,
    token,
    maxAge: 30 * 24 * 60 * 60,
  })

  console.log("[loginAction] encodedToken length:", encodedToken.length)

  const cookieJar = await cookies()
  cookieJar.set(cookieName, encodedToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge: 30 * 24 * 60 * 60,
  })

  console.log("[loginAction] cookie set, returning success")

  return { success: true }
}
