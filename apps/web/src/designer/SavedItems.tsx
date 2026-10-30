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
  const [name, setName] = useState('')
  const [confirming, setConfirming] = useState(false)
  const selected = items.find((i) => i.id === selectedId)
  const trimmed = name.trim()

  const select = (id: string) => {
    setSelectedId(id)
    setName(items.find((i) => i.id === id)?.name ?? '')
    setConfirming(false)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className={field}>
        Saved {noun}s
        <select className={input} value={selected ? selectedId : ''} onChange={(e) => select(e.target.value)}>
          <option value="">{items.length ? `Choose a ${noun}…` : `No saved ${noun}s`}</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        <button className={small} disabled={!selected} onClick={() => selected && onLoad(selected.id)}>
          Load
        </button>
        <button className={small} disabled={!selected} onClick={() => selected && onSave(selected.id)}>
          Save changes
        </button>
        <button
          className={small}
          disabled={!selected || !trimmed || trimmed === selected.name}
          onClick={() => selected && onRename(selected.id, trimmed)}
        >
          Rename
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
      <div className="flex gap-1.5">
        <input
          className={`${input} min-w-0 flex-1`}
          aria-label={`${noun[0].toUpperCase() + noun.slice(1)} name`}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className={small}
          disabled={!trimmed}
          onClick={() => {
            const id = onAdd(trimmed)
            setSelectedId(id)
          }}
        >
          Add new
        </button>
      </div>
    </div>
  )
}
