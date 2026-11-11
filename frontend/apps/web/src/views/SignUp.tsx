import { useId, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import AuthCard from '../auth/AuthCard'
import { authConfig } from '../auth/config'
import { useSession, useSignUp } from '../auth/hooks'
import { destinationAfterAuth } from '../auth/redirect'
import { signupBody, validateSignup } from '../auth/validation'
import { field, input, primaryButton } from '../designer/controls'

export default function SignUp() {
  const location = useLocation()
  const session = useSession().data
  const signUp = useSignUp()
  const hintId = useId()
  const mode = authConfig.signupMode
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [problem, setProblem] = useState<string | null>(null)

  // Signing up signs the new account in, which is also what sends the user on.
  if (session) return <Navigate to={destinationAfterAuth(location)} replace />

  const values = { mode, username, email, password, confirm }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const invalid = validateSignup(values)
    setProblem(invalid)
    if (!invalid) signUp.mutate(signupBody(values))
  }
  const error = problem ?? signUp.error?.message

  return (
    <AuthCard
      title="Create an account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/signin" state={location.state} className="font-medium text-amber-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-3" onSubmit={submit} noValidate>
        {mode !== 'email' && (
          <label className={field}>
            Username
            <input className={input} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
        )}
        {mode !== 'username' && (
          <div className="flex flex-col gap-1">
            <label className={field}>
              Email
              <input
                className={input}
                type="email"
                autoComplete="email"
                aria-describedby={mode === 'email' ? hintId : undefined}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            {mode === 'email' && (
              <span id={hintId} className="text-xs text-slate-500">
                We'll pick a username for you; you can change it later.
              </span>
            )}
          </div>
        )}
        <label className={field}>
          Password
          <input className={input} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label className={field}>
          Confirm password
          <input className={input} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button className={`${primaryButton} disabled:opacity-50`} disabled={signUp.isPending}>
          {signUp.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthCard>
  )
}
