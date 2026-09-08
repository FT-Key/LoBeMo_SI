"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { encode } from "@auth/core/jwt"
import { logger } from "@/lib/logger"

export async function loginAction(
  _prevState: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  logger.debug({ email }, "[loginAction] intento de login")

  if (!email || !password) {
    logger.debug("[loginAction] campos faltantes")
    return { error: "Email y contraseña son requeridos" }
  }

  const empleado = await prisma.empleado.findUnique({ where: { email } })
  if (!empleado || !empleado.activo) {
    logger.debug({ email }, "[loginAction] usuario no encontrado o inactivo")
    return { error: "Email o contraseña incorrectos" }
  }

  const isValid = await bcrypt.compare(password, empleado.password)
  if (!isValid) {
    logger.warn({ email }, "[loginAction] credenciales invalidas")
    return { error: "Email o contraseña incorrectos" }
  }

  logger.debug("[loginAction] credenciales validas, creando sesion")

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

  logger.debug("[loginAction] token de sesion generado")

  const cookieJar = await cookies()
  cookieJar.set(cookieName, encodedToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    maxAge: 30 * 24 * 60 * 60,
  })

  logger.debug("[loginAction] sesion creada con exito")

  return { success: true }
}
