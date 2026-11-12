import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSitemaps, sitePages } from './sitemap.ts'

const updated = new Date('2026-11-12T22:41:54.371Z')

test('sitePages lists the puzzle list, categories and puzzles by slug, once each', () => {
  const pages = sitePages(['Churches & Cathedrals', 'Cities', 'cities', '!!!'], [{ name: 'Matterhorn at Sunset', updated }, { name: 'Matterhorn at sunset', updated }])
  assert.deepEqual(pages, [
    { path: '/puzzles' },
    { path: '/category/churches-cathedrals' },
    { path: '/category/cities' },
    { path: '/puzzles/matterhorn-at-sunset', lastmod: updated },
  ])
})

test('buildSitemaps writes one escaped urlset with UTC lastmod dates', () => {
  const files = buildSitemaps('https://example.com/', [{ path: '/puzzles' }, { path: '/puzzles/a&b', lastmod: updated }])
  assert.equal(files.length, 1)
  assert.equal(files[0].name, 'sitemap.xml')
  assert.equal(
    files[0].xml,
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/puzzles</loc>
  </url>
  <url>
    <loc>https://example.com/puzzles/a&amp;b</loc>
    <lastmod>2026-11-12</lastmod>
  </url>
</urlset>
`,
  )
})

test('buildSitemaps splits past the limit and writes an index', () => {
  const urls = [1, 2, 3].map((n) => ({ path: `/puzzles/p${n}` }))
  const files = buildSitemaps('https://example.com', urls, 'maps/site.xml', 2)
  assert.deepEqual(files.map((f) => f.name), ['maps/site-1.xml', 'maps/site-2.xml', 'maps/site.xml'])
  assert.match(files[0].xml, /p1[\s\S]*p2/)
  assert.doesNotMatch(files[0].xml, /p3/)
  assert.match(files[2].xml, /<sitemapindex[\s\S]*<loc>https:\/\/example.com\/maps\/site-1.xml<\/loc>[\s\S]*site-2.xml/)
})

test('parseArgs: --test uses the local dev frontend unless --base-url is given', async () => {
  const { parseArgs } = await import('../cli/sitemap.ts')
  assert.deepEqual(parseArgs(['--test'], { SITE_BASE_URL: 'https://b.example' }), { baseUrl: 'http://localhost:5174', out: 'sitemap.xml' })
  assert.equal(parseArgs(['--test', '--base-url', 'https://a.example'], {}).baseUrl, 'https://a.example')
  assert.equal(parseArgs(['--out', 'x.xml'], { SITE_BASE_URL: 'https://b.example' }).baseUrl, 'https://b.example')
  assert.throws(() => parseArgs([], {}))
})
