import { useNavigate } from 'react-router-dom'
import { attributeOf, type GameSummaryRow } from '../api/gameSummaries'

/**
 * The pieces and rating line every game card shows, both read from the game's summary row. The rating opens that
 * game's reviews, where a review can be added. Cards are themselves links, so this is a role="link" span that
 * navigates on click instead of a nested anchor.
 */
export default function GameMeta({ game, compact = false }: { game: GameSummaryRow; compact?: boolean }) {
  const pieces = attributeOf(game, 'pieceCount')
  return (
    <div className="flex justify-between gap-2 text-slate-500">
      <span>{pieces ? `${pieces} pieces` : ''}</span>
      {!compact && <ReviewsLink gameId={game.id} name={game.name} average={game.averageRating} count={game.reviewCount} />}
    </div>
  )
}

/** A game's rating, or "No reviews", as a link to its reviews page, where a review can be written. */
export function ReviewsLink({ gameId, name, average, count, short = false }: { gameId: number; name: string; average: number | null; count: number; short?: boolean }) {
  const navigate = useNavigate()
  const go = () => navigate(`/reviews?game=${gameId}`)
  const rated = average != null && count > 0
  return (
    <span
      role="link"
      tabIndex={0}
      aria-label={rated ? `Rated ${average.toFixed(1)} from ${count} ${count === 1 ? 'review' : 'reviews'}. Open reviews of ${name}` : `No reviews yet. Open reviews of ${name}`}
      className="cursor-pointer text-right hover:text-amber-600 hover:underline"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        go()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          e.stopPropagation()
          go()
        }
      }}
    >
      {rated ? `★ ${average.toFixed(1)}${short ? '' : ` (${count})`}` : 'No reviews'}
    </span>
  )
}
