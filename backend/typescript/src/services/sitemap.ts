import { slug } from './slug.ts'

/** One page of the site: a path such as `/puzzles/matterhorn-at-sunset` and, when known, when it last changed. */
export type SitemapUrl = { path: string; lastmod?: Date }

/** A file the `sitemap` command writes. */
export type SitemapFile = { name: string; xml: string }

/** The protocol allows 50,000 URLs (and 50 MB) per file. */
export const MAX_URLS_PER_FILE = 50_000

const NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'

/** Escapes text for use in XML element content. */
export function xmlEscape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

/** The pages of the site: the puzzle list, a page per category and a page per puzzle, named by the slug of their names. */
export function sitePages(categories: string[], puzzles: { name: string; updated: Date }[]): SitemapUrl[] {
  const pages: SitemapUrl[] = [{ path: '/puzzles' }]
  const seen = new Set<string>()
  for (const name of categories) {
    const s = slug(name)
    if (s && !seen.has(`c/${s}`)) pages.push({ path: `/category/${s}` }), seen.add(`c/${s}`)
  }
  for (const puzzle of puzzles) {
    const s = slug(puzzle.name)
    if (s && !seen.has(`p/${s}`)) pages.push({ path: `/puzzles/${s}`, lastmod: puzzle.updated }), seen.add(`p/${s}`)
  }
  return pages
}

/**
 * The sitemaps.org XML for `urls`. One file named `fileName` when they fit; otherwise numbered files
 * (`sitemap-1.xml`, ...) of at most `max` URLs plus a sitemap index under `fileName` that lists them.
 * `<lastmod>` is the UTC date (`YYYY-MM-DD`).
 */
export function buildSitemaps(baseUrl: string, urls: SitemapUrl[], fileName = 'sitemap.xml', max = MAX_URLS_PER_FILE): SitemapFile[] {
  const base = baseUrl.replace(/\/+$/, '')
  const dot = fileName.lastIndexOf('.')
  const [stem, ext] = dot > 0 ? [fileName.slice(0, dot), fileName.slice(dot)] : [fileName, '']
  const lastmod = (d?: Date) => (d ? `\n    <lastmod>${d.toISOString().slice(0, 10)}</lastmod>` : '')
  const urlset = (chunk: SitemapUrl[]) =>
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${NS}">\n${chunk
      .map((u) => `  <url>\n    <loc>${xmlEscape(base + u.path)}</loc>${lastmod(u.lastmod)}\n  </url>\n`)
      .join('')}</urlset>\n`
  if (urls.length <= max) return [{ name: fileName, xml: urlset(urls) }]

  const files: SitemapFile[] = []
  for (let i = 0; i * max < urls.length; i++) files.push({ name: `${stem}-${i + 1}${ext}`, xml: urlset(urls.slice(i * max, (i + 1) * max)) })
  const index = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="${NS}">\n${files
    .map((f) => `  <sitemap>\n    <loc>${xmlEscape(`${base}/${f.name}`)}</loc>\n  </sitemap>\n`)
    .join('')}</sitemapindex>\n`
  return [...files, { name: fileName, xml: index }]
}
