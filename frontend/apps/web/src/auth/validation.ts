export type SignupMode = 'username' | 'email' | 'both'

export type SignupValues = { mode: SignupMode; username: string; email: string; password: string; confirm: string }

/** bcrypt, which the server uses, only looks at the first 72 bytes. */
const MAX_PASSWORD_BYTES = 72
const USERNAME = /^[A-Za-z0-9_.-]{3,32}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** The first problem with the form, or null when it can be sent. The server stays the authority. */
export function validateSignup(v: SignupValues): string | null {
  if (v.mode !== 'email' && !USERNAME.test(v.username.trim())) return 'Username must be 3-32 characters: letters, digits, "_", "." or "-".'
  if (v.mode !== 'username' && !EMAIL.test(v.email.trim())) return 'Enter a valid email address.'
  if (!v.password) return 'Enter a password.'
  if (new TextEncoder().encode(v.password).length > MAX_PASSWORD_BYTES) return `Password must be at most ${MAX_PASSWORD_BYTES} bytes.`
  if (v.password !== v.confirm) return 'Passwords do not match.'
  return null
}

/** The request body for the chosen mode; only the fields that mode shows are sent. */
export function signupBody(v: SignupValues) {
  return {
    ...(v.mode !== 'email' && { username: v.username.trim() }),
    ...(v.mode !== 'username' && { email: v.email.trim() }),
    password: v.password,
  }
}
