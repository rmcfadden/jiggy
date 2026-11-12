import { Link } from 'react-router-dom'
import { useFinishedPlays } from '../api/gamePlays'
import { useGameSummaries } from '../api/gameSummaries'
import { useSession } from '../auth/hooks'
import { ICON_DIMENSIONS } from './browsePrefs'
import GameMeta from './GameMeta'

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

/** The signed-in user's finished puzzles, most recent first; each opens its finished board. */
export default function PlayHistory() {
  const signedIn = !!useSession().data
  const plays = useFinishedPlays(signedIn)
  const games = useGameSummaries().data
  if (!signedIn) return null
  return (
    <section aria-label="History" className="mb-6">
      <h2 className="mb-2 text-lg font-semibold">History</h2>
      {plays.isError ? (
        <p className="text-sm text-slate-600">Couldn't load your history.</p>
      ) : !plays.data || !games ? (
        <p className="text-sm text-slate-600">Loading…</p>
      ) : plays.data.length === 0 ? (
        <p className="text-sm text-slate-600">No finished puzzles yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {plays.data.map((play) => {
            const game = games.find((g) => g.id === play.gameId)
            const dims = ICON_DIMENSIONS.medium
            return (
              <Link
                key={play.id}
                to={`/puzzle?id=${play.gameId}&play=${play.id}`}
                className={`flex shrink-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm hover:border-amber-500 ${dims.card}`}
              >
                {game && <img src={game.thumbnameLocation} alt={game.name} loading="lazy" className={`${dims.image} w-full object-cover`} />}
                <div className="flex flex-col gap-1 p-3 text-sm">
                  <span className="truncate font-medium">{game?.name ?? `Puzzle ${play.gameId}`}</span>
                  {game && <GameMeta game={game} />}
                  <time dateTime={play.finished} className="text-xs text-slate-500">
                    Finished {when(play.finished)}
                  </time>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
