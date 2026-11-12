import { Link, useSearchParams } from 'react-router-dom'
import { useGameSummaries } from '../api/gameSummaries'
import GameReviews from './GameReviews'

/** `/reviews?game=ID`: one game's name and picture above its reviews. */
export default function ReviewsPage() {
  const [params] = useSearchParams()
  const gameId = /^\d+$/.test(params.get('game') ?? '') ? Number(params.get('game')) : null
  const game = useGameSummaries().data?.find((g) => g.id === gameId)
  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <Link to="/puzzles" className="text-sm font-medium text-amber-600 hover:underline">← Puzzles</Link>
      {gameId === null ? (
        <p className="mt-4 text-sm text-slate-600">Choose a puzzle to see its reviews.</p>
      ) : (
        <>
          <div className="mt-2 mb-4 flex items-center gap-3">
            {game && <img src={game.thumbnameLocation} alt="" className="h-16 w-16 rounded object-cover" />}
            <h1 className="text-2xl font-semibold">{game ? `Reviews of ${game.name}` : 'Reviews'}</h1>
          </div>
          <GameReviews gameId={gameId} />
        </>
      )}
    </div>
  )
}
