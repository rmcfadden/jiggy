import type { SignupMode } from './validation'

/**
 * Auth settings the pages read. `signupMode` picks which fields /signup asks for:
 * 'username' (username + password), 'email' (email + password; the server makes up the username)
 * or 'both' (email + username + password). This is the one place to swap for a loaded setting later.
 */
export const authConfig: { signupMode: SignupMode } = { signupMode: 'email' }
