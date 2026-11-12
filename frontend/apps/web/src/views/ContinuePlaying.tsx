import { Link } from 'react-router-dom'
import { useUnfinishedPlays } from '../api/gamePlays'
import { useGameSummaries } from '../api/gameSummaries'
import { useSession } from '../auth/hooks'
import { ICON_DIMENSIONS, type IconSize } from './browsePrefs'

/**
 * The signed-in user's unfinished plays as a row of cards, newest first, each opening that play where it was left.
 * A game with several unfinished plays shows its newest. Renders nothing when signed out or when there is nothing to continue.
 */
export default function ContinuePlaying({ size = 'medium' }: { size?: IconSize }) {
  const signedIn = !!useSession().data
  const plays = useUnfinishedPlays(signedIn).data
  const games = useGameSummaries().data
  if (!signedIn || !plays || !games) return null
  const seen = new Set<number>()
  const items = plays.flatMap((play) => {
    const game = games.find((g) => g.id === play.gameId)
    if (!game || seen.has(game.id)) return []
    seen.add(game.id)
    return [{ play, game }]
  })
  if (items.length === 0) return null
  const dims = ICON_DIMENSIONS[size]
  return (
    <section aria-label="Continue playing" className="mb-6">
      <h2 className="mb-2 text-lg font-semibold">Continue playing</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map(({ play, game }) => (
          <Link
            key={play.id}
            to={`/puzzle?id=${game.id}&play=${play.id}`}
            className={`flex shrink-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm hover:border-amber-500 ${dims.card}`}
          >
            <img src={game.thumbnameLocation} alt={game.name} loading="lazy" className={`${dims.image} w-full object-cover`} />
            <span className={`truncate font-medium ${size === 'small' ? 'p-2 text-xs' : 'p-3 text-sm'}`}>{game.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
