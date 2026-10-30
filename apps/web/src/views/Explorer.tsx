import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CATALOG, averageRating, puzzlesInCategory, type Category, type Puzzle } from '@jiggy/shared'
import { TEMPLATE_SIZES } from '../designer/gameAssets'

const pieceCount = (p: Puzzle) => {
  const size = TEMPLATE_SIZES.find((t) => t.id === p.template.size)
  return size ? size.cols * size.rows : Number(p.template.size)
}

function CategoryTree({ categories, selected, onSelect, depth = 0 }: {
  categories: Category[]
  selected: string | undefined
  onSelect: (id: string | undefined) => void
  depth?: number
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {categories.map((c) => (
        <li key={c.id}>
          <button
            aria-pressed={selected === c.id}
            title={c.description}
            style={{ paddingLeft: 8 + depth * 14 }}
            className={`w-full rounded py-1 pr-2 text-left text-sm ${
              selected === c.id ? 'bg-amber-100 font-medium text-amber-900' : 'hover:bg-slate-100'
            }`}
            onClick={() => onSelect(c.id)}
          >
            {c.name}
          </button>
          {c.children.length > 0 && (
            <CategoryTree categories={c.children} selected={selected} onSelect={onSelect} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  )
}

function Card({ puzzle }: { puzzle: Puzzle }) {
  const rating = averageRating(puzzle)
  return (
    <Link
      to={`/puzzle?id=${puzzle.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm hover:border-amber-500"
    >
      <img src={puzzle.image.location} alt={puzzle.image.name} loading="lazy" className="h-40 w-full object-cover" />
      <div className="flex flex-col gap-1 p-3 text-sm">
        <span className="font-medium">{puzzle.name}</span>
        <div className="flex justify-between text-slate-500">
          <span>{pieceCount(puzzle)} pieces</span>
          <span>{rating !== null ? `★ ${rating.toFixed(1)} (${puzzle.reviews.length})` : 'No reviews'}</span>
        </div>
      </div>
    </Link>
  )
}

export default function Explorer() {
  const [category, setCategory] = useState<string | undefined>()
  const puzzles = puzzlesInCategory(CATALOG, category)
  return (
    <div className="flex h-full">
      <nav aria-label="Categories" className="w-52 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-3">
        <button
          aria-pressed={category === undefined}
          className={`mb-1 w-full rounded px-2 py-1 text-left text-sm ${
            category === undefined ? 'bg-amber-100 font-medium text-amber-900' : 'hover:bg-slate-100'
          }`}
          onClick={() => setCategory(undefined)}
        >
          All puzzles
        </button>
        <CategoryTree categories={CATALOG.categories} selected={category} onSelect={setCategory} />
      </nav>
      <div className="min-w-0 flex-1 overflow-y-auto p-6">
        <h1 className="mb-4 text-2xl font-bold">Puzzles</h1>
        {puzzles.length === 0 ? (
          <p className="text-slate-500">No puzzles in this category yet.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
            {puzzles.map((p) => (
              <Card key={p.id} puzzle={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
