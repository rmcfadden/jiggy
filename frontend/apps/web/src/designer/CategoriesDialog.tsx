import { useState } from 'react'
import type { CategoryRow } from '../api/categories'

const small = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white'

type Props = {
  categories: CategoryRow[]
  /** Ids of the categories the game is in now. */
  selected: number[]
  onApply: (ids: number[]) => void
  onClose: () => void
}

/** Pick one or more categories for the game; nothing changes until Apply. */
export function CategoriesDialog({ categories, selected, onApply, onClose }: Props) {
  const [chosen, setChosen] = useState(() => new Set(selected))
  const toggle = (id: number) =>
    setChosen((c) => {
      const next = new Set(c)
      if (!next.delete(id)) next.add(id)
      return next
    })
  const ids = new Set(categories.map((c) => c.id))
  // A category whose parent is missing (disabled or deleted) is shown at the top level so it can still be chosen.
  const childrenOf = (parent: number | null) => categories.filter((c) => (c.parentId !== null && ids.has(c.parentId) ? c.parentId : null) === parent)
  // Ids the game still carries but the server no longer lists are kept untouched.
  const unknown = selected.filter((id) => !ids.has(id))

  const rows = (parent: number | null, depth: number): React.ReactNode =>
    childrenOf(parent).map((c) => (
      <li key={c.id}>
        <label className="flex items-start gap-2 py-0.5 text-sm" style={{ paddingLeft: depth * 16 }}>
          <input type="checkbox" className="mt-1" checked={chosen.has(c.id)} onChange={() => toggle(c.id)} />
          <span>
            {c.name}
            {c.description && <span className="block text-xs text-slate-500">{c.description}</span>}
          </span>
        </label>
        {childrenOf(c.id).length > 0 && <ul>{rows(c.id, depth + 1)}</ul>}
      </li>
    ))

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Categories"
        className="flex max-h-[80vh] w-96 max-w-[90vw] flex-col gap-3 rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <h3 className="text-lg font-semibold">Categories</h3>
        <p className="text-sm text-slate-500">Choose every category the game belongs to.</p>
        <ul className="min-h-0 flex-1 overflow-y-auto" aria-label="Category list">
          {categories.length === 0 ? <li className="py-2 text-sm text-slate-500">No categories yet.</li> : rows(null, 0)}
        </ul>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-slate-500">{chosen.size} selected</span>
          <div className="flex gap-2">
            <button type="button" className={small} onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="rounded border border-amber-500 bg-amber-500 px-2 py-1 text-sm font-medium text-slate-900 hover:bg-amber-600"
              onClick={() => onApply([...new Set([...chosen, ...unknown])].sort((a, b) => a - b))}
              autoFocus
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
