import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as {
          email: string
          password: string
        }

        if (!email || !password) return null

        const empleado = await prisma.empleado.findUnique({
          where: { email },
        })

        if (!empleado || !empleado.activo) return null

        const isValid = await bcrypt.compare(password, empleado.password)
        if (!isValid) return null

        return {
          id: empleado.id,
          email: empleado.email,
          name: `${empleado.nombre} ${empleado.apellido}`,
          rol: empleado.rol,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.rol = (user as any).rol
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub!
      session.user.rol = token.rol as string
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
})
