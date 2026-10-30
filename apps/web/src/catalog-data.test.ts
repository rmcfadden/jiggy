import { expect, it } from 'vitest'
import { CATALOG } from '@jiggy/shared'
import { TEMPLATE_SIZES, TEMPLATE_STYLES } from './designer/gameAssets'

it('uses only known template sizes and styles', () => {
  for (const p of CATALOG.puzzles) {
    expect(TEMPLATE_SIZES.some((s) => s.id === p.template.size), `${p.id} size`).toBe(true)
    expect(TEMPLATE_STYLES.some((s) => s.id === p.template.style), `${p.id} style`).toBe(true)
  }
})
