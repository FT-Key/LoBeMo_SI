import { LoginForm } from "./login-form"

export default async function LoginPage(props: { searchParams?: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams ?? {}
  const errorMessage = searchParams.error === "CredentialsSignin"
    ? "Email o contraseña incorrectos"
    : null

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">LoBeMo Seguridad Informática</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Iniciar sesión en el sistema
          </p>
        </div>
        <LoginForm externalError={errorMessage} />
      </div>
    </div>
  )
}
