import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MAX_COMMENT, useAddReview, useReviews } from '../api/reviews'
import { useSession } from '../auth/hooks'
import { input, primaryButton } from '../designer/controls'

const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })

/** `rating` of 5 stars drawn filled or empty; the text label is for screen readers. */
export function Stars({ rating }: { rating: number }) {
  const whole = Math.round(rating)
  return (
    <span role="img" aria-label={`${rating} out of 5 stars`} className="text-amber-500">
      {'★'.repeat(whole)}
      <span className="text-slate-300">{'★'.repeat(5 - whole)}</span>
    </span>
  )
}

/**
 * A game's reviews: the average rating, every review newest first, and, for a signed-in user who has not reviewed it
 * yet, a form to add theirs. Reading needs no sign-in.
 */
export default function GameReviews({ gameId }: { gameId: number }) {
  const reviews = useReviews(gameId)
  const session = useSession().data
  return (
    <section aria-label="Reviews" className="flex flex-col gap-4">
      {reviews.isError ? (
        <p role="alert" className="text-sm text-slate-600">Couldn't load the reviews.</p>
      ) : !reviews.data ? (
        <p className="text-sm text-slate-600">Loading…</p>
      ) : (
        <>
          <p className="text-sm text-slate-600">
            {reviews.data.average === null ? (
              'No reviews yet.'
            ) : (
              <>
                <Stars rating={reviews.data.average} /> {reviews.data.average.toFixed(1)} from {reviews.data.count} {reviews.data.count === 1 ? 'review' : 'reviews'}
              </>
            )}
          </p>
          {session ? (
            reviews.data.reviews.some((r) => r.userName === session.username) ? (
              <p className="text-sm text-slate-600">You've reviewed this puzzle. Thank you!</p>
            ) : (
              <ReviewForm gameId={gameId} />
            )
          ) : (
            <p className="text-sm text-slate-600">
              <Link to="/signin" className="font-medium text-amber-600 hover:underline">Sign in</Link> to write a review.
            </p>
          )}
          <ul className="flex flex-col gap-3">
            {reviews.data.reviews.map((r) => (
              <li key={r.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{r.userName}</span>
                  <time dateTime={r.created} className="text-xs text-slate-500">{when(r.created)}</time>
                </div>
                <Stars rating={r.rating} />
                {r.comment && <p className="mt-1 whitespace-pre-wrap">{r.comment}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function ReviewForm({ gameId }: { gameId: number }) {
  const add = useAddReview(gameId)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  return (
    <form
      aria-label="Write a review"
      className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm"
      onSubmit={(e) => {
        e.preventDefault()
        if (rating > 0) add.mutate({ rating, comment })
      }}
    >
      <div role="radiogroup" aria-label="Rating" className="flex gap-1 text-2xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
            className={n <= rating ? 'text-amber-500' : 'text-slate-300 hover:text-amber-300'}
            onClick={() => setRating(n)}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        aria-label="Comment"
        className={`${input} min-h-20`}
        placeholder="What did you think? (optional)"
        maxLength={MAX_COMMENT}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {add.isError && <p role="alert" className="text-red-700">{add.error.message}</p>}
      <button type="submit" className={`${primaryButton} self-start`} disabled={rating === 0 || add.isPending}>
        Post review
      </button>
    </form>
  )
}
