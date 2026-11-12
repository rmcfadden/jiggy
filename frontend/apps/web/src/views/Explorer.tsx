import { useState } from 'react'
import { useMutationState, useQuery } from '@tanstack/react-query'
import {
  DEFAULT_GAME_CONFIG,
  averageRating,
  findPuzzle,
  puzzlesInCategory,
  type Catalog,
  type Category,
  type Puzzle,
} from '@jiggy/shared'
import { START_PLAY_KEY } from '../api/gamePlays'
import PlayLink from './PlayLink'
import { attributeOf, useGameSummaries, type GameSummaryRow } from '../api/gameSummaries'
import { TEMPLATE_SIZES } from '../designer/gameAssets'
import {
  ICON_DIMENSIONS,
  ICON_SIZES,
  LAYOUTS,
  SIDES,
  useBrowsePrefs,
  type BrowsePrefs,
  type IconSize,
} from './browsePrefs'
import { recordPlayed, useProfile } from './profile'

const pieceCount = (p: Puzzle) => {
  const size = TEMPLATE_SIZES.find((t) => t.id === p.template.size)
  return size ? size.cols * size.rows : Number(p.template.size)
}

const byRating = (a: Puzzle, b: Puzzle) => (averageRating(b) ?? 0) - (averageRating(a) ?? 0)

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

function Card({ puzzle, size, inList, onToggleList, className = '' }: {
  puzzle: Puzzle
  size: IconSize
  inList: boolean
  onToggleList: (id: string) => void
  className?: string
}) {
  const rating = averageRating(puzzle)
  const dims = ICON_DIMENSIONS[size]
  return (
    <div className={`relative ${className}`}>
      <PlayLink
        gameId={puzzle.id}
        onClick={() => recordPlayed(puzzle.id)}
        className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm hover:border-amber-500"
      >
        <img src={puzzle.image.location} alt={puzzle.image.name} loading="lazy" className={`${dims.image} w-full object-cover`} />
        <div className={`flex flex-col gap-1 ${size === 'small' ? 'p-2 text-xs' : 'p-3 text-sm'}`}>
          <span className="truncate font-medium">{puzzle.name}</span>
          <div className="flex justify-between gap-2 text-slate-500">
            <span>{pieceCount(puzzle)} pieces</span>
            <span>{rating !== null ? `★ ${rating.toFixed(1)}${size === 'small' ? '' : ` (${puzzle.reviews.length})`}` : size === 'small' ? '' : 'No reviews'}</span>
          </div>
        </div>
      </PlayLink>
      <button
        aria-label={`${inList ? 'Remove' : 'Add'} ${puzzle.name} ${inList ? 'from' : 'to'} My List`}
        aria-pressed={inList}
        title={inList ? 'Remove from My List' : 'Add to My List'}
        className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-sm text-[#ffffff] hover:bg-black/75"
        onClick={() => onToggleList(puzzle.id)}
      >
        {inList ? '✓' : '+'}
      </button>
    </div>
  )
}

function Segmented<T extends string>({ label, options, value, onChange }: {
  label: string
  options: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-1.5 text-xs text-slate-500">
      <span>{label}</span>
      <div className="flex rounded border border-slate-200 bg-white p-0.5">
        {options.map((o) => (
          <button
            key={o.id}
            aria-pressed={value === o.id}
            className={`h-6 rounded px-2 text-xs font-medium ${
              value === o.id ? 'bg-amber-500 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ClassicView({ prefs, catalog, ...profile }: { prefs: BrowsePrefs; catalog: Catalog } & ProfileProps) {
  const [category, setCategory] = useState<string | undefined>()
  const puzzles = puzzlesInCategory(catalog, category)
  return (
    <div className={`flex min-h-0 flex-1 flex-col ${prefs.side === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
      <nav
        aria-label="Categories"
        className={`max-h-40 shrink-0 overflow-y-auto border-b border-slate-200 bg-white p-3 md:max-h-none md:w-44 md:border-b-0 lg:w-52 ${
          prefs.side === 'right' ? 'md:border-l' : 'md:border-r'
        }`}
      >
        <button
          aria-pressed={category === undefined}
          className={`mb-1 w-full rounded px-2 py-1 text-left text-sm ${
            category === undefined ? 'bg-amber-100 font-medium text-amber-900' : 'hover:bg-slate-100'
          }`}
          onClick={() => setCategory(undefined)}
        >
          All puzzles
        </button>
        <CategoryTree categories={catalog.categories} selected={category} onSelect={setCategory} />
      </nav>
      <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
        {puzzles.length === 0 ? (
          <p className="text-slate-500">No puzzles in this category yet.</p>
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${ICON_DIMENSIONS[prefs.iconSize].min}, 1fr))` }}
          >
            {puzzles.map((p) => (
              <Card key={p.id} puzzle={p} size={prefs.iconSize} inList={profile.list.includes(p.id)} onToggleList={profile.toggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

type ProfileProps = { list: string[]; recent: string[]; toggle: (id: string) => void }

function Row({ title, puzzles, size, profile }: { title: string; puzzles: Puzzle[]; size: IconSize; profile: ProfileProps }) {
  if (puzzles.length === 0) return null
  return (
    <section aria-label={title} className="mb-6">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {puzzles.map((p) => (
          <Card
            key={p.id}
            puzzle={p}
            size={size}
            className={`shrink-0 ${ICON_DIMENSIONS[size].card}`}
            inList={profile.list.includes(p.id)}
            onToggleList={profile.toggle}
          />
        ))}
      </div>
    </section>
  )
}

function NetflixView({
  prefs,
  update,
  catalog,
  ...profile
}: { prefs: BrowsePrefs; update: (p: Partial<BrowsePrefs>) => void; catalog: Catalog } & ProfileProps) {
  const topLevel = catalog.categories
  const shown = prefs.rows.length > 0 ? prefs.rows : topLevel.map((c) => c.id)
  const toggleRow = (id: string) => {
    const next = shown.includes(id) ? shown.filter((x) => x !== id) : [...shown, id]
    update({ rows: next.length === topLevel.length ? [] : next })
  }
  const topRated = catalog.puzzles.filter((p) => p.reviews.length > 0).sort(byRating)
  const featured = topRated[0]
  const find = (id: string) => findPuzzle(catalog, id)
  const mine = profile.list.map(find).filter((p): p is Puzzle => !!p)
  const recent = profile.recent.map(find).filter((p): p is Puzzle => !!p)
  return (
    <div className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
      {featured && (
        <PlayLink
          gameId={featured.id}
          onClick={() => recordPlayed(featured.id)}
          className="relative mb-6 block h-48 overflow-hidden rounded-xl bg-[#0f172a] md:h-64"
        >
          <img src={featured.image.location} alt="" className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-[#ffffff]">
            <p className="text-xs tracking-wide uppercase opacity-80">Top rated</p>
            <p className="text-2xl font-bold">{featured.name}</p>
            <p className="text-sm opacity-90">
              ★ {averageRating(featured)!.toFixed(1)} · {pieceCount(featured)} pieces
            </p>
          </div>
        </PlayLink>
      )}
      <div role="group" aria-label="Rows" className="mb-5 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-slate-500">Categories</span>
        {topLevel.map((c) => (
          <button
            key={c.id}
            aria-pressed={shown.includes(c.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              shown.includes(c.id)
                ? 'border-amber-500 bg-amber-100 text-amber-900'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => toggleRow(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>
      <Row title="Continue playing" puzzles={recent} size={prefs.iconSize} profile={profile} />
      <Row title="My List" puzzles={mine} size={prefs.iconSize} profile={profile} />
      <Row title="Top rated" puzzles={topRated.slice(0, 10)} size={prefs.iconSize} profile={profile} />
      {topLevel
        .filter((c) => shown.includes(c.id))
        .map((c) => (
          <Row key={c.id} title={c.name} puzzles={puzzlesInCategory(catalog, c.id)} size={prefs.iconSize} profile={profile} />
        ))}
    </div>
  )
}

const categoryIdByName = (categories: Category[], map = new Map<string, string>()) => {
  for (const c of categories) {
    map.set(c.name, c.id)
    categoryIdByName(c.children, map)
  }
  return map
}

/** The saved games from /api/games_summaries, shown with their thumbnails, filed under the categories from /api/categories. */
function useCatalog() {
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error(`GET /api/categories failed: ${res.status}`)
      return res.json()
    },
  })
  const games = useGameSummaries()
  const categories = categoriesQuery.data ?? []
  const idByName = categoryIdByName(categories)
  const toPuzzle = (g: GameSummaryRow): Puzzle => ({
    id: String(g.id),
    name: g.name,
    categories: g.categories.flatMap((c) => idByName.get(c.name) ?? []),
    template: { size: attributeOf(g, 'pieceCount') ?? '0', style: 'subtle' },
    settings: DEFAULT_GAME_CONFIG,
    image: { name: g.name, location: g.thumbnameLocation },
    reviews: [],
  })
  const catalog: Catalog = { categories, puzzles: (games.data ?? []).map(toPuzzle) }
  return { catalog, isError: categoriesQuery.isError || games.isError }
}

export default function Explorer() {
  const [prefs, update] = useBrowsePrefs()
  const profile = useProfile()
  const { catalog, isError } = useCatalog()
  // The newest attempt to start a play; its error (other than an expired session, which sends the user to sign in) is shown.
  const lastStart = useMutationState({ filters: { mutationKey: START_PLAY_KEY }, select: (m) => ({ status: m.state.status, error: m.state.error as Error | null }) }).at(-1)
  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-slate-200 px-4 py-3 md:px-6">
        <h1 className="text-2xl font-bold">Puzzles</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Segmented label="Layout" options={LAYOUTS} value={prefs.layout} onChange={(layout) => update({ layout })} />
          {prefs.layout === 'classic' && (
            <Segmented label="Sidebar" options={SIDES} value={prefs.side} onChange={(side) => update({ side })} />
          )}
          <Segmented label="Icons" options={ICON_SIZES} value={prefs.iconSize} onChange={(iconSize) => update({ iconSize })} />
        </div>
      </header>
      {isError && <p className="px-4 py-2 text-sm text-red-600 md:px-6">Couldn't load puzzles from the server.</p>}
      {lastStart?.status === 'error' && (
        <p role="alert" className="px-4 py-2 text-sm text-red-600 md:px-6">
          Couldn't start the puzzle: {lastStart.error?.message}
        </p>
      )}
      {prefs.layout === 'classic' ? (
        <ClassicView prefs={prefs} catalog={catalog} {...profile} />
      ) : (
        <NetflixView prefs={prefs} update={update} catalog={catalog} {...profile} />
      )}
    </div>
  )
}
