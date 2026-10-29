import { useState } from 'react'
import { GameTab } from './GameTab'
import { JigsawTab } from './JigsawTab'
import { PieceTab } from './PieceTab'

const TABS = [
  { id: 'game', label: 'Game', content: GameTab },
  { id: 'jigsaw', label: 'Jigsaw Template', content: JigsawTab },
  { id: 'piece', label: 'Piece', content: PieceTab },
] as const

export default function Designer() {
  const [active, setActive] = useState<(typeof TABS)[number]['id']>('game')
  const Active = TABS.find((t) => t.id === active)!.content

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div role="tablist" className="flex gap-1 border-b border-slate-200 bg-slate-100 px-4 pt-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={t.id === active}
            aria-controls="tabpanel"
            className={`rounded-t px-4 py-2 text-sm font-medium ${
              t.id === active
                ? 'bg-white text-amber-700 shadow-[inset_0_2px_0_0_#f59e0b]'
                : 'text-slate-600 hover:bg-slate-200'
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
