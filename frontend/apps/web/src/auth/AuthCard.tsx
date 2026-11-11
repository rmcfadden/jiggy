import type { ReactNode } from 'react'
import { SSO_PROVIDERS } from './providers'

const outline = 'rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100'

/** The centered card both auth pages sit in; renders the single sign-on buttons when any are configured. */
export default function AuthCard(props: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 p-4 md:p-6">
      <h1 className="text-2xl font-semibold">{props.title}</h1>
      {SSO_PROVIDERS.length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            {SSO_PROVIDERS.map((p) => (
              <button key={p.id} type="button" className={outline} onClick={p.start}>
                Continue with {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500" role="separator">
            <span className="h-px flex-1 bg-slate-300" />
            or
            <span className="h-px flex-1 bg-slate-300" />
          </div>
        </>
      )}
      {props.children}
      <p className="text-sm text-slate-600">{props.footer}</p>
    </div>
  )
}
