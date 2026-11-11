import { readFile } from 'node:fs/promises'
import type { ICRUDRepository } from '@deterministic-code/datasources'
import { game, type Game } from '../../generated/types/view/game.ts'
import { gameCategory, type GameCategory } from '../../generated/types/datasource/gameCategory.ts'
import type { CategoriesService } from './categories.ts'
import type { GameParentsService } from './gameParents.ts'
import type { TemplatesService } from './templates.ts'
import type { ImagesService } from './images.ts'

/**
 * What the API exchanges. A game is a puzzle described by three things: its `templateId`, its background
 * `imageId` and its `config` (every setting of the designer panel, as JSON). They are stored as game settings
 * (`template_uid`, `image_id`, `config`) without foreign keys, so each game keeps its own template and image.
 */
export type GameDto = {
  id: number
  uuid: string
  name: string
  description: string
  /** The `location` of the parent game, e.g. `scrambled`. */
  parent: string
  templateId: number
  imageId: number | null
  config: unknown
  categoryIds: number[]
  /** The generated thumbnail of the image, when it has one. */
  thumbnailUrl: string | null
  created: Date
  updated: Date
}

/** A game as the list returns it: without `config`, which `get` loads for the one that is selected. */
export type GameListItem = Omit<GameDto, 'config'>

export type GameInput = {
  name?: string
  description?: string
  parent?: string
  templateId?: number
  imageId?: number | null
  config?: unknown
  categoryIds?: number[]
}

/** One entry of `backend/data/puzzles.json`: `slug` is the image resource name, `setup` the full default config. */
export type PuzzleSeed = { slug: string; name: string; description?: string; parent: string; template: string; categories?: string[]; setup: unknown }

/** A game refers to a parent game, template, image or category that does not exist. */
export class UnknownReferenceError extends Error {}

const CONFIG_KEY = 'config'
/** Setting holding the uuid of the game's template. */
const TEMPLATE_KEY = 'template_uid'
/** Setting holding the id of the game's background image (a cms resource); absent when it has none. */
const IMAGE_KEY = 'image_id'
/** Attribute holding the pieces in the game's template (`cols * rows`). */
export const PIECE_COUNT = 'pieceCount'

export class GamesService {
  constructor(
    private readonly repo: ICRUDRepository<Game>,
    private readonly gameCategories: ICRUDRepository<GameCategory>,
    private readonly categories: CategoriesService,
    private readonly parents: GameParentsService,
    private readonly templates: TemplatesService,
    private readonly images: ImagesService,
  ) {}

  async list(): Promise<GameListItem[]> {
    const templateIds = await this.templateIds()
    const categoryOf = await this.categoriesByGame()
    const thumbs = await this.images.thumbnailUrls()
    const parents = await this.parentLocations()
    const list: GameListItem[] = []
    for await (const row of this.repo.read()) {
      const templateId = templateIds.get(row.settings[TEMPLATE_KEY])
      if (!row.isDeleted && templateId !== undefined) list.push(toListItem(row, templateId, parents.get(Number(row.gameParentId)) ?? '', categoryOf.get(Number(row.id)) ?? [], thumbs))
    }
    return list
  }

  async get(id: number): Promise<GameDto | undefined> {
    const row = await this.find(id)
    const templateId = row && (await this.templateIds()).get(row.settings[TEMPLATE_KEY])
    if (!row || templateId === undefined) return undefined
    return toDto(row, templateId, (await this.parentLocations()).get(Number(row.gameParentId)) ?? '', await this.categoryIdsOf(id), await this.images.thumbnailUrls())
  }

  /** Creates the game; the template, image, parent and categories must exist. */
  async create(input: GameInput): Promise<GameDto> {
    const parent = await this.findParent(input.parent ?? fail('parent is required'))
    const templateId = input.templateId ?? fail('templateId is required')
    const templateUid = await this.templateUid(templateId)
    await this.checkImage(input.imageId)
    await this.checkCategories(input.categoryIds)

    const created = await this.repo.create(
      game({
        name: input.name ?? '',
        description: input.description ?? '',
        gameParentId: Number(parent.id),
        settings: settings(templateUid, input.imageId ?? null, input.config),
        attributes: await this.attributesOf(templateId),
        categories: [],
      }),
    )
    await this.setCategories(Number(created.id), input.categoryIds ?? [])
    return (await this.get(Number(created.id)))!
  }

  /** Merges the fields present in `input`; undefined when the game does not exist. */
  async update(id: number, input: GameInput): Promise<GameDto | undefined> {
    const row = await this.find(id)
    if (!row || !row.settings[TEMPLATE_KEY]) return undefined

    const next = { ...row.settings }
    if (input.parent !== undefined) row.gameParentId = Number((await this.findParent(input.parent)).id)
    if (input.templateId !== undefined) {
      next[TEMPLATE_KEY] = await this.templateUid(input.templateId)
      row.attributes = { ...row.attributes, ...(await this.attributesOf(input.templateId)) }
    }
    if (input.imageId !== undefined) {
      await this.checkImage(input.imageId)
      if (input.imageId === null) delete next[IMAGE_KEY]
      else next[IMAGE_KEY] = String(input.imageId)
    }
    if (input.config !== undefined) next[CONFIG_KEY] = JSON.stringify(input.config)
    row.settings = next
    await this.checkCategories(input.categoryIds)
    row.name = input.name ?? row.name
    row.description = input.description ?? row.description
    await this.repo.update(row)
    if (input.categoryIds) await this.setCategories(id, input.categoryIds)
    return this.get(id)
  }

  async delete(id: number): Promise<boolean> {
    const row = await this.find(id)
    if (!row) return false
    await this.setCategories(id, [])
    await this.repo.delete(row)
    return true
  }

  /**
   * Creates the sample puzzles in the seed file at `path` whose game name is missing; existing games are never
   * changed. The parent, template, image and categories of each entry must already exist (run the earlier setup
   * steps first), otherwise it throws naming the entry. Returns the names added.
   */
  async addPuzzles(path: string): Promise<string[]> {
    const seeds = JSON.parse(await readFile(path, 'utf8')) as PuzzleSeed[]
    const present = new Set<string>()
    for await (const row of this.repo.read()) present.add(row.name)
    const templateIds = new Map((await this.templates.list('jigsaw')).map((t) => [t.name, t.id]))
    const categoryIds = new Map((await this.categories.flat()).filter((c) => c.parentId !== null).map((c) => [c.name.toLowerCase(), c.id]))
    const added: string[] = []
    for (const seed of seeds) {
      if (present.has(seed.name)) continue
      try {
        const templateId = templateIds.get(seed.template) ?? fail(`unknown template: ${seed.template}`)
        const image = (await this.images.find({ name: seed.slug })) ?? fail(`unknown image: ${seed.slug}`)
        const ids = (seed.categories ?? []).map((c) => categoryIds.get(c.toLowerCase()) ?? fail(`unknown category: ${c}`))
        await this.create({ name: seed.name, description: seed.description, parent: seed.parent, templateId, imageId: image.id, config: seed.setup, categoryIds: ids })
      } catch (err) {
        if (err instanceof UnknownReferenceError) throw new UnknownReferenceError(`puzzle '${seed.slug}': ${err.message}`)
        throw err
      }
      added.push(seed.name)
    }
    return added
  }

  /**
   * Gives every game its attributes where they are missing or the template changed behind its back (run by
   * `setup`); returns the names of the games it updated.
   */
  async addAttributes(): Promise<string[]> {
    const templateIds = await this.templateIds()
    const updated: string[] = []
    for await (const row of this.repo.read()) {
      const templateId = templateIds.get(row.settings[TEMPLATE_KEY])
      if (templateId === undefined || row.isDeleted) continue
      const wanted = await this.attributesOf(templateId)
      if (Object.entries(wanted).every(([k, v]) => row.attributes[k] === v)) continue
      row.attributes = { ...row.attributes, ...wanted }
      await this.repo.update(row)
      updated.push(row.name)
    }
    return updated
  }

  /** The attributes a game gets from its template: `pieceCount` is `cols * rows` of the template's JSON. */
  private async attributesOf(templateId: number): Promise<Record<string, string>> {
    const content = (await this.templates.get(templateId))?.content as { cols?: number; rows?: number } | undefined
    return { [PIECE_COUNT]: String((content?.cols ?? 0) * (content?.rows ?? 0)) }
  }

  private async find(id: number): Promise<Game | undefined> {
    const row = await this.repo.readSingleById(id)
    return row && !row.isDeleted ? row : undefined
  }

  private async categoriesByGame(): Promise<Map<number, number[]>> {
    const map = new Map<number, number[]>()
    for await (const row of this.gameCategories.read()) {
      const ids = map.get(Number(row.gameId)) ?? []
      ids.push(Number(row.categoryId))
      map.set(Number(row.gameId), ids)
    }
    for (const ids of map.values()) ids.sort((a, b) => a - b)
    return map
  }

  private async categoryIdsOf(gameId: number): Promise<number[]> {
    return (await this.categoriesByGame()).get(gameId) ?? []
  }

  /** Makes the game belong to exactly `ids`, adding and removing only the rows that differ. */
  private async setCategories(gameId: number, ids: number[]): Promise<void> {
    const wanted = new Set(ids)
    const present = new Set<number>()
    for await (const row of this.gameCategories.read()) {
      if (Number(row.gameId) !== gameId) continue
      if (wanted.has(Number(row.categoryId)) && !present.has(Number(row.categoryId))) present.add(Number(row.categoryId))
      else await this.gameCategories.delete(row)
    }
    for (const id of [...wanted].filter((i) => !present.has(i)).sort((a, b) => a - b)) {
      await this.gameCategories.create(gameCategory({ gameId, categoryId: id }))
    }
  }

  private async checkCategories(ids?: number[]): Promise<void> {
    if (!ids) return
    const known = new Set((await this.categories.flat()).map((c) => c.id))
    const bad = ids.find((id) => !known.has(id))
    if (bad !== undefined) throw new UnknownReferenceError(`unknown category: ${bad}`)
  }

  private async findParent(location: string) {
    return (await this.parents.list()).find((p) => p.location === location) ?? fail(`unknown parent game: ${location}`)
  }

  private async parentLocations(): Promise<Map<number, string>> {
    return new Map((await this.parents.list()).map((p) => [Number(p.id), p.location]))
  }

  /** The uuid stored in a game's `template_uid` setting; throws when the template does not exist. */
  private async templateUid(id: number): Promise<string> {
    return (await this.templates.get(id))?.uuid ?? fail(`unknown template: ${id}`)
  }

  /** Template uuid to template id. */
  private async templateIds(): Promise<Map<string, number>> {
    return new Map((await this.templates.list()).map((t) => [t.uuid, t.id]))
  }

  private async checkImage(id?: number | null): Promise<void> {
    if (id != null && !(await this.images.find({ id }))) throw new UnknownReferenceError(`unknown image: ${id}`)
  }
}

function fail(message: string): never {
  throw new UnknownReferenceError(message)
}

const settings = (templateUid: string, imageId: number | null, config: unknown): Record<string, string> => ({
  [TEMPLATE_KEY]: templateUid,
  ...(imageId === null ? {} : { [IMAGE_KEY]: String(imageId) }),
  ...(config === undefined ? {} : { [CONFIG_KEY]: JSON.stringify(config) }),
})

function toDto(row: Game, templateId: number, parent: string, categoryIds: number[], thumbs: Map<number, string>): GameDto {
  const json = row.settings[CONFIG_KEY]
  return { ...toListItem(row, templateId, parent, categoryIds, thumbs), config: json ? JSON.parse(json) : {} }
}

function toListItem(row: Game, templateId: number, parent: string, categoryIds: number[], thumbs: Map<number, string>): GameListItem {
  const imageId = row.settings[IMAGE_KEY] ? Number(row.settings[IMAGE_KEY]) : null
  return {
    id: Number(row.id),
    uuid: row.uuid,
    name: row.name,
    description: row.description,
    parent,
    templateId,
    imageId,
    categoryIds,
    thumbnailUrl: imageId === null ? null : (thumbs.get(imageId) ?? null),
    created: row.created,
    updated: row.updated,
  }
}
