import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useConfirmEmail, useSession } from '../auth/hooks'

/** The page the link in a confirmation email opens: it uses the code once, then says whether the email is confirmed. */
export default function ConfirmEmail() {
  const code = useSearchParams()[0].get('code')
  const session = useSession().data
  const client = useQueryClient()
  const confirm = useConfirmEmail()
  const started = useRef(false)

  useEffect(() => {
    if (!code || started.current) return
    started.current = true // the code works once, so never send it twice (React strict mode runs effects twice)
    confirm.mutate(code, { onSuccess: () => void client.invalidateQueries({ queryKey: ['email-status'] }) })
  }, [code, confirm, client])

  let body
  if (!code) {
    body = <p role="alert" className="text-sm text-red-600">This page needs the link from your confirmation email.</p>
  } else if (confirm.isError) {
    body = (
      <>
        <p role="alert" className="text-sm text-red-600">{confirm.error.message}</p>
        <p className="text-sm text-slate-600">
          {session ? (
            <>
              You can ask for a new email from your{' '}
              <Link to="/profile" className="font-medium text-amber-600 hover:underline">profile</Link>.
            </>
          ) : (
            <>
              <Link to="/signin" className="font-medium text-amber-600 hover:underline">Sign in</Link> to ask for a new email.
            </>
          )}
        </p>
      </>
    )
  } else if (confirm.isSuccess) {
    body = (
      <>
        <p role="status" className="text-sm text-green-700">Your email address is confirmed. Thank you!</p>
        <p className="text-sm">
          <Link to={session ? '/puzzles' : '/signin'} className="font-medium text-amber-600 hover:underline">
            {session ? 'Continue to the puzzles' : 'Sign in'}
          </Link>
        </p>
      </>
    )
  } else {
    body = <p className="text-sm text-slate-600">Confirming your email…</p>
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-3 p-4 md:p-6">
      <h1 className="text-2xl font-semibold">Confirm email</h1>
      {body}
    </div>
  )
}
