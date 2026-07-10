import { NextResponse } from "next/server"
import { ZodSchema } from "zod"

type ValidateResult<T> =
  | { success: true; data: T }
  | { success: false; error: NextResponse }

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): ValidateResult<T> {
  const result = schema.safeParse(body)
  if (!result.success) {
    const firstError = result.error.issues[0]
    return {
      success: false,
      error: NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      ),
    }
  }
  return { success: true, data: result.data }
}

export function validateBodyAll<T>(schema: ZodSchema<T>, body: unknown): ValidateResult<T> {
  const result = schema.safeParse(body)
  if (!result.success) {
    const messages = result.error.issues.map((e) => e.message).join(", ")
    return {
      success: false,
      error: NextResponse.json(
        { error: messages },
        { status: 400 }
      ),
    }
  }
  return { success: true, data: result.data }
}
