import "next-auth"
import { Rol } from "@prisma/client"

declare module "next-auth" {
  interface User {
    rol?: Rol
  }

  interface Session {
    user: {
      id: string
      rol: Rol
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol?: Rol
  }
}
