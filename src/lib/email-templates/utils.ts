import nodemailer from "nodemailer"
import { readFile } from "fs/promises"
import { join } from "path"

const DOMINIO_LOBEMO = "@lobemo.com"

export function resolverDestinatario(email: string): string {
  const redirect = process.env.SMTP_REDIRECT_TO
  if (redirect && email.toLowerCase().endsWith(DOMINIO_LOBEMO)) {
    return redirect
  }
  return email
}

export function sanitize(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

export function createTransporter() {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!user || !pass) return null
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } })
}

export async function getLogoAttachment(): Promise<{ filename: string; content: Buffer; cid: string }[]> {
  try {
    const logoBuffer = await readFile(join(process.cwd(), "public", "lobemo-logo.png"))
    return [{ filename: "lobemo-logo.png", content: logoBuffer, cid: "logo@lobemo" }]
  } catch {
    return []
  }
}

export async function getLogoCid(): Promise<string> {
  try {
    await readFile(join(process.cwd(), "public", "lobemo-logo.png"))
    return "logo@lobemo"
  } catch {
    return ""
  }
}
