import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Datasource, type ICRUDRepository } from '@deterministic-code/datasources'
import type { Category } from '../../generated/types/view/category.ts'
import type { GameParent } from '../../generated/types/view/gameParent.ts'
import { CategoriesService, type CategorySeed } from '../services/categories.ts'
import { GameParentsService } from '../services/gameParents.ts'
import { GamesService } from '../services/games.ts'
import { ImagesService } from '../services/images.ts'
import { TemplatesService } from '../services/templates.ts'
import { createSetupService } from './users.ts'
import type { Game } from '../../generated/types/view/game.ts'
import type { GameCategory } from '../../generated/types/datasource/gameCategory.ts'
import type { MimeType } from '../../generated/types/datasource/mimeType.ts'
import type { Resource } from '../../generated/types/view/resource.ts'
import type { TemplateBase } from '../../generated/types/datasource/templateBase.ts'
import type { TemplateType } from '../../generated/types/datasource/templateType.ts'

/** The game types the designer ships with; `location` is the id the frontend matches on. */
export const GAME_PARENTS = [
  { name: 'Scrambled pieces', description: 'Every piece starts in the tray, shuffled.', location: 'scrambled' },
  { name: 'Next pieces in panel', description: 'The panel only offers the next few pieces.', location: 'next-pieces' },
  { name: 'Solve last X pieces', description: 'The puzzle starts nearly done; finish the last few.', location: 'last-x' },
]

/** Adds the built-in parent games that are not there yet; returns the names it added. */
export async function addParentGames(service: GameParentsService): Promise<string[]> {
  const have = new Set((await service.list()).map((g) => g.location))
  const added: string[] = []
  for (const game of GAME_PARENTS) {
    if (have.has(game.location)) continue
    await service.create(game)
    added.push(game.name)
  }
  return added
}

const seedFile = (env: string | undefined, relative: string) => env ?? fileURLToPath(new URL(relative, import.meta.url))

export async function setup(): Promise<void> {
  const ds = Datasource.default as Datasource & {
    gameParents: ICRUDRepository<GameParent>
    categories: ICRUDRepository<Category>
    templates: ICRUDRepository<TemplateBase>
    templateTypes: ICRUDRepository<TemplateType>
    games: ICRUDRepository<Game>
      gameCategories: ICRUDRepository<GameCategory>
    resources: ICRUDRepository<Resource>
    mimeTypes: ICRUDRepository<MimeType>
  }
  const gameParents = new GameParentsService(ds.gameParents)
  const categoriesService = new CategoriesService(ds.categories)
  const templates = new TemplatesService(ds.templates, ds.templateTypes)
  const images = new ImagesService(ds.resources, ds.mimeTypes)

  const parents = await addParentGames(gameParents)
  console.log(parents.length ? `added parent games: ${parents.join(', ')}` : 'parent games already present')
  const seeds = JSON.parse(await readFile(seedFile(process.env.CATEGORIES_SEED_PATH, '../../../data/categories.json'), 'utf8')) as CategorySeed[]
  const categories = await categoriesService.addCategories(seeds)
  console.log(categories.length ? `added ${categories.length} categories` : 'categories already present')
  const types = await templates.addTypes()
  console.log(types.length ? `added template types: ${types.join(', ')}` : 'template types already present')
  const added = await templates.addTemplates(seedFile(process.env.TEMPLATES_SEED_PATH, '../../../data/templates.json'))
  console.log(added.length ? `added templates: ${added.join(', ')}` : 'templates already present')
  const samples = await images.addSamples(seedFile(process.env.IMAGES_SAMPLES_PATH, '../../../../frontend/apps/web/public/catalog'))
  console.log(samples.length ? `added sample images: ${samples.join(', ')}` : 'sample images already present')
  const games = new GamesService(ds.games, ds.gameCategories, categoriesService, gameParents, templates, images)
  const puzzles = await games.addPuzzles(seedFile(process.env.PUZZLES_SEED_PATH, '../../../data/puzzles.json'))
  console.log(puzzles.length ? `added ${puzzles.length} puzzles` : 'puzzles already present')
  const attributes = await games.addAttributes()
  console.log(attributes.length ? `added attributes to ${attributes.length} games` : 'game attributes already present')
  const identitySetup = createSetupService()
  const identity = await identitySetup.addDefaults()
  console.log(identity.roles.length ? `added roles: ${identity.roles.join(', ')}` : 'roles already present')
  console.log(identity.groups.length ? `added groups: ${identity.groups.join(', ')}` : 'groups already present')
  const admin = await identitySetup.addAdmin(process.env.ADMIN_PASSWORD)
  if (!admin) console.log('users already present, no admin added')
  else if (admin.generated) console.log(`added user admin with password ${admin.password} (shown once; change it with update-user)`)
  else console.log('added user admin with the password from ADMIN_PASSWORD')
  const user = await identitySetup.addUser(process.env.USER_PASSWORD)
  if (!user) console.log('user already present, no user added')
  else if (user.generated) console.log(`added user user (no admin role) with password ${user.password} (shown once; change it with update-user)`)
  else console.log('added user user (no admin role) with the password from USER_PASSWORD')
}
