import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UnauthorizedError, useStartGamePlay } from '../api/gamePlays'
import { useSession, useSignOut } from '../auth/hooks'
import { slug } from '@jiggy/shared'

/**
 * A link to a puzzle that starts a new play of it first: a click creates the play on the server, then opens the
 * puzzle with the play's id (`/puzzle?id=<game>&play=<play>`, or `/puzzles/<name slug>?play=<play>` when `name` is given). Modified clicks (new tab) just follow the link.
 * An expired session signs the user out and sends them to sign in, coming back to the puzzle afterwards.
 */
export default function PlayLink(props: { gameId: string; name?: string; className?: string; onClick?: () => void; children: ReactNode }) {
  const navigate = useNavigate()
  const start = useStartGamePlay()
  const signOut = useSignOut()
  const signedIn = Boolean(useSession().data)
  const named = props.name && /^\d+$/.test(props.gameId) && slug(props.name) !== ''
  const href = named ? `/puzzles/${slug(props.name!)}` : `/puzzle?id=${props.gameId}`
  const withPlay = (playId: number) => `${href}${named ? '?' : '&'}play=${playId}`
  return (
    <Link
      to={href}
      className={props.className}
      onClick={(e) => {
        props.onClick?.()
        if (!signedIn || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !/^\d+$/.test(props.gameId)) return
        e.preventDefault()
        start.mutate(Number(props.gameId), {
          onSuccess: (play) => navigate(withPlay(play.id)),
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
