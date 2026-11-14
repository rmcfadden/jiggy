import { useState } from 'react'
import { SettingsTab } from './SettingsTab'

const TABS = [{ id: 'settings', label: 'Settings', content: SettingsTab }] as const

export default function Admin() {
  const [active, setActive] = useState<(typeof TABS)[number]['id']>('settings')
  const Active = TABS.find((t) => t.id === active)!.content

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div role="tablist" className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-slate-100 px-2 pt-2 md:px-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`admin-tab-${t.id}`}
            aria-selected={t.id === active}
            aria-controls="admin-tabpanel"
            className={`shrink-0 whitespace-nowrap rounded-t px-3 py-2 md:px-4 text-sm font-medium ${
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
      <div role="tabpanel" id="admin-tabpanel" aria-labelledby={`admin-tab-${active}`} className="flex min-h-0 min-w-0 flex-1">
        <Active />
      </div>
    </div>
  )
}
