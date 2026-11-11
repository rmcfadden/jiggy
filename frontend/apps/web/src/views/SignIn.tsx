import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import AuthCard from '../auth/AuthCard'
import { useSession, useSignIn } from '../auth/hooks'
import { destinationAfterAuth } from '../auth/redirect'
import { field, input, primaryButton } from '../designer/controls'

export default function SignIn() {
  const location = useLocation()
  const session = useSession().data
  const signIn = useSignIn()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Signing in sets the session, which is also what sends the user on; so does arriving already signed in.
  if (session) return <Navigate to={destinationAfterAuth(location)} replace />

  const submit = (e: FormEvent) => {
    e.preventDefault()
    signIn.mutate({ username: username.trim(), password })
  }

  return (
    <AuthCard
      title="Sign in"
      footer={
        <>
          No account yet?{' '}
          <Link to="/signup" state={location.state} className="font-medium text-amber-600 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-3" onSubmit={submit}>
        <label className={field}>
          Username or email
          <input className={input} autoComplete="username" autoFocus value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className={field}>
          Password
          <input className={input} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {signIn.error && (
          <p role="alert" className="text-sm text-red-600">
            {signIn.error.message}
          </p>
        )}
        <button className={`${primaryButton} disabled:opacity-50`} disabled={!username.trim() || !password || signIn.isPending}>
          {signIn.isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthCard>
  )
}
