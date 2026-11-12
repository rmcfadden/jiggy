import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { gameByNameQuery } from '../api/games'
import Player from './Player'

/** `/puzzles/:name`: looks the puzzle up by the slug of its name, then shows it like `/puzzle?id=<id>` does. */
export default function PuzzleByName() {
  const { name = '' } = useParams()
  const game = useQuery(gameByNameQuery(name))
  if (game.data) return <Player gameId={game.data.id} />
  if (game.isError) {
    return (
      <p role="alert" className="p-6 text-slate-600">
        There is no puzzle called “{name}”. <Link to="/puzzles" className="font-medium underline">Browse all puzzles</Link>.
      </p>
    )
  }
  return <p role="status" className="p-6 text-slate-500">Loading…</p>
}
