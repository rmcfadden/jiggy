import { useNavigate } from 'react-router-dom'
import { attributeOf, type GameSummaryRow } from '../api/gameSummaries'
import { useReviews } from '../api/reviews'

/**
 * The pieces and rating line every game card shows, read from the game's summary row and its reviews. The rating
 * opens that game's reviews, where a review can be added. Cards are themselves links, so this is a role="link" span
 * that navigates on click instead of a nested anchor.
 */
export default function GameMeta({ game, compact = false }: { game: GameSummaryRow; compact?: boolean }) {
  const pieces = attributeOf(game, 'pieceCount')
  return (
    <div className="flex justify-between gap-2 text-slate-500">
      <span>{pieces ? `${pieces} pieces` : ''}</span>
      {!compact && <Rating game={game} />}
    </div>
  )
}

function Rating({ game }: { game: GameSummaryRow }) {
  const navigate = useNavigate()
  const reviews = useReviews(game.id).data
  const go = () => navigate(`/reviews?game=${game.id}`)
  const label = !reviews ? 'Reviews' : reviews.average == null ? 'No reviews' : `★ ${reviews.average.toFixed(1)} (${reviews.count})`
  return (
    <span
      role="link"
      tabIndex={0}
      aria-label={reviews?.average == null ? `Reviews of ${game.name}` : `Rated ${reviews.average.toFixed(1)} from ${reviews.count} ${reviews.count === 1 ? 'review' : 'reviews'}. Open reviews of ${game.name}`}
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
      {label}
    </span>
  )
}
