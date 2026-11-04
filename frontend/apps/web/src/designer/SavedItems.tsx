import { useState } from 'react'
import { field, input } from './controls'

const small = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white'

export type SavedItemsProps = {
  items: { id: string; name: string }[]
  /** Applies a saved item to the designer. */
  onLoad: (id: string) => void
  /** Saves the designer's current setup as a new item. */
  onAdd: (name: string) => string
  /** Overwrites a saved item with the designer's current setup. */
  onSave: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

/** Pick a saved item, then load, overwrite, rename or delete it — or save the current setup as a new one. */
export function SavedItems({ noun, items, onLoad, onAdd, onSave, onRename, onDelete }: SavedItemsProps & {
  /** Singular, lowercase: "game", "template". */
  noun: string
}) {
  const [selectedId, setSelectedId] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [dialog, setDialog] = useState<'new' | 'rename' | null>(null)
  const [name, setName] = useState('')
  const selected = items.find((i) => i.id === selectedId)
  const trimmed = name.trim()

  const select = (id: string) => {
    setSelectedId(id)
    setConfirming(false)
  }
  const open = (kind: 'new' | 'rename') => {
    setName(kind === 'rename' ? (selected?.name ?? '') : '')
    setDialog(kind)
  }
  const submit = () => {
    if (!trimmed) return
    if (dialog === 'new') select(onAdd(trimmed))
    else if (selected) onRename(selected.id, trimmed)
    setDialog(null)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <select
        aria-label={`Saved ${noun}s`}
        className={input}
        value={selected ? selectedId : ''}
        onChange={(e) => select(e.target.value)}
      >
        <option value="">{items.length ? `Choose a ${noun}…` : `No saved ${noun}s`}</option>
        {items.map((i) => (
          <option key={i.id} value={i.id}>
            {i.name}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-1">
        <button className={small} disabled={!selected} onClick={() => selected && onLoad(selected.id)}>
          Load
        </button>
        <button className={small} title="Overwrite with the current setup" disabled={!selected} onClick={() => selected && onSave(selected.id)}>
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
              <button type="submit" className={`${small} border-amber-500 bg-amber-500 font-medium text-white hover:bg-amber-600`} disabled={!trimmed}>
                {dialog === 'new' ? 'Create' : 'Rename'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
