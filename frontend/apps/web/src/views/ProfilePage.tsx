import { Link } from 'react-router-dom'
import { useEmailStatus, useResendConfirmation, useSession, useSignOut } from '../auth/hooks'
import { primaryButton } from '../designer/controls'
import ContinuePlaying from './ContinuePlaying'
import PlayHistory from './PlayHistory'

export default function ProfilePage() {
  const session = useSession().data
  const signOut = useSignOut()
  const status = useEmailStatus().data
  const resend = useResendConfirmation()
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      {session ? (
        <>
        <div className="mt-4 flex flex-col items-start gap-3">
          <p className="text-sm">
            Signed in as <strong>{session.username}</strong>
          </p>
          {status?.email && !status.verified && (
            <div role="status" className="flex flex-col items-start gap-1 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-slate-900">
              <p>
                Your email <strong>{status.email}</strong> is not confirmed yet. Open the link we sent you.
              </p>
              <button className="font-medium text-amber-700 hover:underline disabled:opacity-50" disabled={resend.isPending || resend.isSuccess} onClick={() => resend.mutate()}>
                {resend.isSuccess ? 'Email sent' : resend.isPending ? 'Sending…' : 'Send it again'}
              </button>
              {resend.error && <p role="alert" className="text-red-600">{resend.error.message}</p>}
            </div>
          )}
          <button className={primaryButton} onClick={signOut}>
            Sign out
          </button>
        </div>
        <div className="mt-6">
          <ContinuePlaying />
          <PlayHistory />
        </div>
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-600">
          You're not signed in.{' '}
          <Link to="/signin" className="font-medium text-amber-600 hover:underline">
            Sign in
          </Link>{' '}
          or{' '}
          <Link to="/signup" className="font-medium text-amber-600 hover:underline">
            create an account
          </Link>
          .
        </p>
      )}
    </div>
  )
}
