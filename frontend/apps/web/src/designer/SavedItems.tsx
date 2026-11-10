import { useEffect, useRef, useState } from 'react'
import { field, input } from './controls'

const small = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white'

export type SavedItemsProps = {
  items: { id: string; name: string }[]
  /** Applies a saved item to the designer. */
  onLoad: (id: string) => void
  /** Saves the designer's current setup as a new item. */
  onAdd: (name: string) => string | Promise<string>
  /** Overwrites a saved item with the designer's current setup. */
  onSave: (id: string) => void
  /** Whether the designer's current setup differs from the saved item; Save stays disabled while it does not. */
  isChanged?: (id: string) => boolean
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  /** A failed load or save, shown under the controls. */
  error?: string | null
  /** While true, an empty list is not yet known to be empty. */
  loading?: boolean
  /** Always keep one item selected: ask for a first one when none exist, otherwise pick the first and load it. */
  required?: boolean
  /** Ask for a first item when none exist, without also selecting one. */
  promptWhenEmpty?: boolean
  /** Reports which item is selected ('' when none), so the caller can disable what depends on a selection. */
  onSelectedChange?: (id: string) => void
}

/** Pick a saved item to load it, then overwrite, rename or delete it — or save the current setup as a new one. */
export function SavedItems({ noun, items, onLoad, onAdd, onSave, isChanged, onRename, onDelete, error, loading, required, promptWhenEmpty, onSelectedChange }: SavedItemsProps & {
  /** Singular, lowercase: "game", "template". */
  noun: string
}) {
  const [selectedId, setSelectedId] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [dialog, setDialog] = useState<'new' | 'rename' | null>(null)
  const [name, setName] = useState('')
  const selected = items.find((i) => i.id === selectedId)
  const trimmed = name.trim()
  const empty = !!(required || promptWhenEmpty) && !loading && !error && items.length === 0
  const prompted = useRef(false)

  // With nothing saved yet, go straight to naming the first one (once, so Cancel stays cancelled).
  useEffect(() => {
    if (!empty || prompted.current) return
    prompted.current = true
    setName('')
    setDialog('new')
  }, [empty])

  // Items exist but none is chosen (first load, or the chosen one was deleted): choose and load the first.
  useEffect(() => {
    if (!required || loading || selectedId || items.length === 0) return
    setSelectedId(items[0].id)
    onLoad(items[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [required, loading, selectedId, items])

  const select = (id: string) => {
    setSelectedId(id)
    setConfirming(false)
    onSelectedChange?.(id)
  }
  const open = (kind: 'new' | 'rename') => {
    setName(kind === 'rename' ? (selected?.name ?? '') : '')
    setDialog(kind)
  }
  const submit = async () => {
    if (!trimmed) return
    const creating = dialog === 'new'
    setDialog(null)
    if (creating) {
      try {
        select(await onAdd(trimmed))
      } catch {
        // The caller surfaces the failure through `error`.
      }
    }
    else if (selected) onRename(selected.id, trimmed)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {error && (
        <p role="alert" className="rounded border border-red-500 bg-red-50 px-2 py-1 text-sm text-red-700">
          {error}
        </p>
      )}
      <select
        aria-label={`Saved ${noun}s`}
        className={input}
        disabled={items.length === 0}
        value={selected ? selectedId : ''}
        onChange={(e) => {
          select(e.target.value)
          if (e.target.value) onLoad(e.target.value)
        }}
      >
        {!(required && items.length) && <option value="">{items.length ? `Choose a ${noun}…` : `No saved ${noun}s`}</option>}
        {items.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-1">
        <button className={small} title="Overwrite with the current setup" disabled={!selected || (!!isChanged && !isChanged(selected.id))} onClick={() => selected && onSave(selected.id)}>
          Save
        </button>
        <button className={small} onClick={() => open('new')}>
          New…
        </button>
        <button className={small} disabled={!selected} onClick={() => open('rename')}>
          Rename…
        </button>
        {confirming && selected ? (
          <button
            className="rounded border border-red-500 bg-red-50 px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-100"
            onClick={() => {
              onDelete(selected.id)
              select('')
            }}
            onBlur={() => setConfirming(false)}
            autoFocus
          >
            Confirm delete
          </button>
        ) : (
          <button className={small} disabled={!selected} onClick={() => setConfirming(true)}>
            Delete
          </button>
        )}
      </div>
      {dialog && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40" onClick={() => setDialog(null)}>
          <form
            role="dialog"
            aria-modal="true"
            aria-label={`${dialog === 'new' ? 'New' : 'Rename'} ${noun}`}
            className="flex w-80 max-w-[90vw] flex-col gap-3 rounded-lg bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && setDialog(null)}
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <h3 className="text-lg font-semibold">{dialog === 'new' ? `New ${noun}` : `Rename ${noun}`}</h3>
            {dialog === 'new' && <p className="text-sm text-slate-500">Saves the current setup under this name.</p>}
            <label className={field}>
              Name
              <input className={input} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className={small} onClick={() => setDialog(null)}>
                Cancel
              </button>
              <button type="submit" className="rounded border border-amber-500 bg-amber-500 px-2 py-1 text-sm font-medium text-slate-900 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500" disabled={!trimmed}>
                {dialog === 'new' ? 'Create' : 'Rename'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
