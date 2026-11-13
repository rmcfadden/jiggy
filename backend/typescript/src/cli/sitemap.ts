import { mkdir, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { Datasource, type ICRUDRepository } from '@deterministic-code/datasources'
import type { Category } from '../../generated/types/view/category.ts'
import type { Game } from '../../generated/types/view/game.ts'
import type { GameCategory } from '../../generated/types/datasource/gameCategory.ts'
import type { GameParent } from '../../generated/types/view/gameParent.ts'
import type { MimeType } from '../../generated/types/datasource/mimeType.ts'
import type { Resource } from '../../generated/types/view/resource.ts'
import type { TemplateBase } from '../../generated/types/datasource/templateBase.ts'
import type { TemplateType } from '../../generated/types/datasource/templateType.ts'
import type { Language } from '../../generated/types/datasource/language.ts'
import { CategoriesService } from '../services/categories.ts'
import { GameParentsService } from '../services/gameParents.ts'
import { GamesService } from '../services/games.ts'
import { ImagesService } from '../services/images.ts'
import { TemplatesService } from '../services/templates.ts'
import { buildSitemaps, sitePages } from '../services/sitemap.ts'

/** Where `npm run dev` serves the frontend; `--test` builds the URLs on it. */
export const TEST_BASE_URL = 'http://localhost:5174'

const USAGE = 'usage: sitemap [--test] [--base-url <https://your-site>] [--out <file>]   (base URL defaults to $SITE_BASE_URL; --test uses the local dev frontend, ' + TEST_BASE_URL + '; file to sitemap.xml)'

/** Reads `--base-url` and `--out` from the arguments after the command name. */
export function parseArgs(args: string[], env: NodeJS.ProcessEnv = process.env): { baseUrl: string; out: string } {
  const values: Record<string, string> = {}
  let test = false
  for (let i = 0; i < args.length; i++) {
    const flag = args[i]
    if (flag === '--test') {
      test = true
      continue
    }
    const value = args[++i]
    if ((flag !== '--base-url' && flag !== '--out') || value === undefined) throw new Error(USAGE)
    values[flag] = value
  }
  const baseUrl = (values['--base-url'] ?? (test ? TEST_BASE_URL : env.SITE_BASE_URL) ?? '').trim()
  if (!baseUrl) throw new Error(`the site's base URL is required: pass --base-url or set SITE_BASE_URL\n${USAGE}`)
  if (!/^https?:\/\/[^/\s]+/.test(baseUrl)) throw new Error(`the base URL must start with http:// or https://: ${baseUrl}`)
  return { baseUrl, out: values['--out'] ?? 'sitemap.xml' }
}

/** Writes the sitemap of every category and puzzle (see `buildSitemaps`) for search engines. */
export async function sitemap(): Promise<void> {
  let options: ReturnType<typeof parseArgs>
  try {
    options = parseArgs(process.argv.slice(3))
  } catch (err) {
    console.error((err as Error).message)
    process.exit(1)
  }
  const ds = Datasource.default as Datasource & {
    gameParents: ICRUDRepository<GameParent>
    categories: ICRUDRepository<Category>
    templates: ICRUDRepository<TemplateBase>
    templateTypes: ICRUDRepository<TemplateType>
    languages: ICRUDRepository<Language>
    games: ICRUDRepository<Game>
    gameCategories: ICRUDRepository<GameCategory>
    resources: ICRUDRepository<Resource>
    mimeTypes: ICRUDRepository<MimeType>
  }
  const categories = new CategoriesService(ds.categories)
  const games = new GamesService(ds.games, ds.gameCategories, categories, new GameParentsService(ds.gameParents), new TemplatesService(ds.templates, ds.templateTypes, ds.languages), new ImagesService(ds.resources, ds.mimeTypes))

  const pages = sitePages((await categories.flat()).map((c) => c.name), await games.list())
  const out = resolve(options.out)
  await mkdir(dirname(out), { recursive: true })
  const files = buildSitemaps(options.baseUrl, pages, basename(out))
  for (const file of files) await writeFile(join(dirname(out), file.name), file.xml)
  console.log(`wrote ${pages.length} URLs to ${out}${files.length > 1 ? ` (${files.length - 1} files plus the index)` : ''}`)
}

