// One-off: downloads sample catalog images from Wikimedia Commons into apps/web/public/catalog/<category>/.
// Usage: node scripts/fetch-catalog-images.mjs
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outRoot = join(root, 'apps/web/public/catalog')
const API = 'https://commons.wikimedia.org/w/api.php'
const UA = 'jiggy-catalog-fetch/1.0 (https://github.com/rmcfadden/jiggy; sample images for a puzzle app)'

// [category dir, slug, Commons search query]
const WANTED = [
  ['mountains', 'matterhorn', 'Matterhorn mountain'],
  ['mountains', 'mount-rainier', 'Mount Rainier'],
  ['forests', 'misty-forest', 'forest path trees'],
  ['beaches', 'tropical-beach', 'tropical beach palm'],
  ['waterfalls', 'iguazu-falls', 'Iguazu Falls'],
  ['birds', 'puffin', 'Atlantic puffin'],
  ['wildlife', 'elephants', 'African elephant savanna'],
  ['pets', 'tabby-cat', 'tabby cat'],
  ['skylines', 'manhattan-skyline', 'Manhattan skyline'],
  ['bridges', 'golden-gate-bridge', 'Golden Gate Bridge'],
  ['castles', 'neuschwanstein', 'Neuschwanstein Castle'],
  ['galaxies', 'andromeda', 'Andromeda galaxy'],
  ['sunsets', 'ocean-sunset', 'sunset over the ocean'],
  ['food', 'fruit-market', 'fruit market stall'],
  ['art', 'starry-night', 'Van Gogh Starry Night'],
  ['art', 'great-wave', 'Great Wave off Kanagawa'],
  ['vehicles', 'steam-locomotive', 'steam locomotive'],
  ['autumn', 'autumn-leaves', 'autumn leaves forest'],
  ['winter', 'snowy-mountains', 'snow covered mountains winter'],
]

const strip = (s = '') => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
const licenseRank = (name = '') => {
  if (/public domain|^pd|cc0/i.test(name)) return 0
  if (/^cc by(-sa)? [0-9]/i.test(name)) return 1
  return 99
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', origin: '*', ...params })}`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

async function pick(query) {
  const data = await api({
    action: 'query', generator: 'search', gsrsearch: `${query} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '30',
    prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1200',
  })
  const pages = Object.values(data.query?.pages ?? {}).sort((a, b) => a.index - b.index)
  const candidates = pages
    .map((p) => ({ p, ii: p.imageinfo?.[0] }))
    .filter(({ ii }) => ii && ii.mime === 'image/jpeg' && ii.width >= 1600 && ii.width >= ii.height * 1.25 && ii.width <= ii.height * 2 && ii.thumburl)
    .map((c) => ({ ...c, license: c.ii.extmetadata?.LicenseShortName?.value ?? '' }))
    .filter((c) => licenseRank(c.license) < 99)
    .sort((a, b) => licenseRank(a.license) - licenseRank(b.license) || a.p.index - b.p.index)
  return candidates[0]
}

async function download(url, dest, tmp) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`download ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length > 5_000_000 || buf.length < 10_000) throw new Error(`bad size ${buf.length}`)
  if (!(buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)) throw new Error('not a JPEG')
  const t = join(tmp, 'dl.jpg')
  await writeFile(t, buf)
  await mkdir(dirname(dest), { recursive: true })
  await rename(t, dest)
}

const tmp = await mkdtemp(join(tmpdir(), 'jiggy-img-'))
const results = []
for (const [dir, slug, query] of WANTED) {
  try {
    const c = await pick(query)
    if (!c) { console.log(`MISS ${slug}`); continue }
    const location = `/catalog/${dir}/${slug}.jpg`
    await download(c.ii.thumburl, join(root, 'apps/web/public', location), tmp)
    results.push({
      dir, slug, location, title: c.p.title.replace(/^File:/, ''),
      author: strip(c.ii.extmetadata?.Artist?.value) || 'Unknown', license: c.license,
      source: c.ii.descriptionurl,
    })
    console.log(`OK   ${slug}  <- ${c.p.title} [${c.license}]`)
  } catch (e) {
    console.log(`FAIL ${slug}: ${e.message}`)
  }
  await new Promise((r) => setTimeout(r, 1500))
}
await rm(tmp, { recursive: true, force: true })

const lines = ['# Catalog image attribution', '', 'Sample images downloaded from Wikimedia Commons (`scripts/fetch-catalog-images.mjs`).', '',
  '| File | Title | Author | License | Source |', '|---|---|---|---|---|',
  ...results.map((r) => `| ${r.location} | ${r.title.replace(/\|/g, '/')} | ${r.author.replace(/\|/g, '/').slice(0, 120)} | ${r.license} | ${r.source} |`), '']
await mkdir(outRoot, { recursive: true })
await writeFile(join(outRoot, 'ATTRIBUTION.md'), lines.join('\n'))
console.log(`${results.length}/${WANTED.length} downloaded`)
