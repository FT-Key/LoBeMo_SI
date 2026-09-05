const DOMINIO_LOBEMO = "@lobemo.com"

export function resolverDestinatario(email: string): string {
  const redirect = process.env.SMTP_REDIRECT_TO
  if (redirect && email.toLowerCase().endsWith(DOMINIO_LOBEMO)) {
    return redirect
  }
  return email
}
