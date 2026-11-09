import { useState } from 'react'
import { useTemplates } from '../api/templates'
import { GameTab } from './GameTab'
import { JigsawTab } from './JigsawTab'
import { PieceTab } from './PieceTab'

const TABS = [
  { id: 'game', label: 'Game', content: GameTab },
  { id: 'jigsaw', label: 'Jigsaw Template', content: JigsawTab },
  { id: 'piece', label: 'Piece', content: PieceTab },
] as const

export default function Designer() {
  const [chosen, setActive] = useState<(typeof TABS)[number]['id']>('game')
  const { data: templates, isLoading } = useTemplates('jigsaw')
  // Games are built on a jigsaw template, so the Game tab waits until one exists.
  const noTemplates = !isLoading && templates?.length === 0
  const active = chosen === 'game' && noTemplates ? 'jigsaw' : chosen
  const Active = TABS.find((t) => t.id === active)!.content

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div role="tablist" className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-slate-100 px-2 pt-2 md:px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={t.id === active}
            aria-controls="tabpanel"
            disabled={t.id === 'game' && noTemplates}
            title={t.id === 'game' && noTemplates ? 'Create a jigsaw template first' : undefined}
            className={`shrink-0 whitespace-nowrap rounded-t px-3 py-2 md:px-4 text-sm font-medium ${
              t.id === active
                ? 'bg-white text-amber-700 shadow-[inset_0_2px_0_0_#f59e0b]'
                : 'text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
            }`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="tabpanel" aria-labelledby={`tab-${active}`} className="flex min-h-0 min-w-0 flex-1">
        <Active />
      </div>
    </div>
  )
}
