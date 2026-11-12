import { Link } from 'react-router-dom'
import { useSession, useSignOut } from '../auth/hooks'
import { primaryButton } from '../designer/controls'
import ContinuePlaying from './ContinuePlaying'
import PlayHistory from './PlayHistory'

export default function Account() {
  const session = useSession().data
  const signOut = useSignOut()
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      {session ? (
        <>
        <div className="mt-4 flex flex-col items-start gap-3">
          <p className="text-sm">
            Signed in as <strong>{session.username}</strong>
          </p>
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
