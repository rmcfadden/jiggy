import { JIGSAW_PRESETS, type JigsawTemplateParams } from '@jiggy/shared'

const varied = JIGSAW_PRESETS.find((p) => p.name === 'Varied')!.ranges

export const GAME_TEMPLATES: { id: string; name: string; params: Partial<JigsawTemplateParams> }[] = [
  { id: 'small', name: 'Small 3×2', params: { cols: 3, rows: 2, seed: 7 } },
  { id: 'classic', name: 'Classic 4×3', params: { cols: 4, rows: 3, seed: 1 } },
  { id: 'varied', name: 'Varied 5×4', params: { cols: 5, rows: 4, seed: 3, ...varied } },
  { id: 'large', name: 'Large 8×6', params: { cols: 8, rows: 6, seed: 5 } },
]

const scene = (sky: [string, string], ground: string, sun: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <circle cx="600" cy="170" r="70" fill="${sun}"/>
      <path d="M0 420 Q150 300 300 400 T600 380 T800 400 V600 H0Z" fill="${ground}"/>
      <path d="M0 500 Q200 430 400 500 T800 480 V600 H0Z" fill="#00000033"/>
    </svg>`,
  )}`

export const GAME_PHOTOS: { id: string; name: string; src: string }[] = [
  { id: 'sunset', name: 'Sunset', src: scene(['#fb923c', '#fde68a'], '#7c2d12', '#fef08a') },
  { id: 'forest', name: 'Forest', src: scene(['#7dd3fc', '#dcfce7'], '#166534', '#fffbeb') },
  { id: 'night', name: 'Night', src: scene(['#1e1b4b', '#6366f1'], '#0f172a', '#e0e7ff') },
]
