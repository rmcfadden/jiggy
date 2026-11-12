import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UnauthorizedError, useStartGamePlay } from '../api/gamePlays'
import { useSignOut } from '../auth/hooks'

/**
 * A link to a puzzle that starts a new play of it first: a click creates the play on the server, then opens the
 * puzzle with the play's id (`/puzzle?id=<game>&play=<play>`). Modified clicks (new tab) just follow the link.
 * An expired session signs the user out and sends them to sign in, coming back to the puzzle afterwards.
 */
export default function PlayLink(props: { gameId: string; className?: string; onClick?: () => void; children: ReactNode }) {
  const navigate = useNavigate()
  const start = useStartGamePlay()
  const signOut = useSignOut()
  const href = `/puzzle?id=${props.gameId}`
  return (
    <Link
      to={href}
      className={props.className}
      onClick={(e) => {
        props.onClick?.()
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !/^\d+$/.test(props.gameId)) return
        e.preventDefault()
        start.mutate(Number(props.gameId), {
          onSuccess: (play) => navigate(`${href}&play=${play.id}`),
          onError: (error) => {
            if (!(error instanceof UnauthorizedError)) return // shown by the Explorer's banner
            signOut()
            navigate('/signin', { state: { from: href } })
          },
        })
      }}
    >
      {props.children}
    </Link>
  )
}
