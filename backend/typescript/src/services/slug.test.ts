import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { slug } from './slug.ts'

const cases = JSON.parse(readFileSync(new URL('../../../data/slug-cases.json', import.meta.url), 'utf8')) as { name: string; slug: string }[]

test('slug matches the shared cases', () => {
  for (const c of cases) assert.equal(slug(c.name), c.slug, c.name)
})
