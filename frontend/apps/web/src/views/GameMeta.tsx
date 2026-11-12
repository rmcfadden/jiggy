import { attributeOf, type GameSummaryRow } from '../api/gameSummaries'

/** The pieces and reviews line every game card shows, read from the game's summary row (no reviews are stored yet). */
export default function GameMeta({ game, compact = false }: { game: GameSummaryRow; compact?: boolean }) {
  const pieces = attributeOf(game, 'pieceCount')
  return (
    <div className="flex justify-between gap-2 text-slate-500">
      <span>{pieces ? `${pieces} pieces` : ''}</span>
      {!compact && <span>No reviews</span>}
    </div>
  )
}
