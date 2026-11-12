import { useEffect, useState } from "react";
import {
  BACKGROUNDS,
  MODES,
  PALETTES,
  applyBackground,
  applyMode,
  applyPalette,
  loadBackground,
  loadMode,
  loadPalette,
} from "./theme";

/** Light/Dark/Auto toggle for the account menu. */
export function ModeToggle() {
  const [mode, setMode] = useState(loadMode);
  return (
    <div
      role="group"
      aria-label="Color mode"
      className="flex rounded bg-slate-200 p-0.5"
    >
      {MODES.map((m) => (
        <button
          key={m.id}
          aria-pressed={mode === m.id}
          className={`h-7 flex-1 rounded text-xs font-medium ${
            mode === m.id
              ? "bg-white text-slate-900 shadow-sm"
              : "hover:bg-slate-300"
          }`}
          onClick={() => {
            setMode(m.id);
            applyMode(m.id);
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

/** Popup with the foreground palette and background pickers. */
export function ColorsDialog({ onClose }: { onClose: () => void }) {
  const [palette, setPalette] = useState(loadPalette);
  const [background, setBackground] = useState(loadBackground);
  const dark = document.documentElement.dataset.theme === "dark";
  const ring = (on: boolean) =>
    on
      ? "ring-2 ring-amber-500 ring-offset-1"
      : "ring-1 ring-slate-300 hover:ring-slate-400";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Colors"
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-5 text-slate-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold">Colors</h2>
        <div role="group" aria-label="Foreground color">
          <div className="mb-1.5 text-xs font-medium text-slate-500">
            Foreground
          </div>
          <div className="flex flex-wrap gap-3">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                aria-label={`${p.label} palette`}
                aria-pressed={palette === p.id}
                title={p.label}
                style={{ background: p.swatch }}
                className={`h-8 w-8 rounded-full ring-offset-white ${ring(palette === p.id)}`}
                onClick={() => {
                  setPalette(p.id);
                  applyPalette(p.id);
                }}
              />
            ))}
          </div>
        </div>
        <div role="group" aria-label="Background color">
          <div className="mb-1.5 text-xs font-medium text-slate-500">
            Background
          </div>
          <div className="flex flex-wrap gap-3">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.id}
                aria-label={`${b.label} background`}
                aria-pressed={background === b.id}
                title={b.label}
                style={{ background: dark ? b.swatchDark : b.swatch }}
                className={`h-8 w-8 rounded-full ring-offset-white ${ring(background === b.id)}`}
                onClick={() => {
                  setBackground(b.id);
                  applyBackground(b.id);
                }}
              />
            ))}
          </div>
        </div>
        <button
          className="h-9 w-full rounded bg-amber-500 text-sm font-medium text-slate-900 hover:bg-amber-600"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}
