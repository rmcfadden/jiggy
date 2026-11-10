import type { ICRUDRepository } from '@deterministic-code/datasources'
import { game, type Game } from '../../generated/types/view/game.ts'
import { gameConfig, type GameConfig } from '../../generated/types/datasource/gameConfig.ts'
import type { GameParent } from '../../generated/types/view/gameParent.ts'
import type { TemplateBase } from '../../generated/types/datasource/templateBase.ts'
import type { Resource } from '../../generated/types/view/resource.ts'

/** What the API exchanges: a game together with its config (`templateId`, `imageId`) and settings. */
export type GameDto = {
  id: number
  uuid: string
  name: string
  description: string
  gameParentId: number
  templateId: number
  /** The id of a cms resource, null when the game has no image. */
  imageId: number | null
  isEnabled: boolean
  settings: Record<string, string>
  created: Date
  updated: Date
}

/** `settings` are applied over the parent game's settings, which every new game starts with. */
export type GameInput = {
  name: string
  description: string
  gameParentId: number
  templateId: number
  imageId?: number | null
  isEnabled?: boolean
  settings?: Record<string, string>
}

/** A game refers to a parent game, template or image that does not exist. */
export class UnknownReferenceError extends Error {}

export class GamesService {
  constructor(
    private readonly repo: ICRUDRepository<Game>,
    private readonly configs: ICRUDRepository<GameConfig>,
    private readonly parents: ICRUDRepository<GameParent>,
    private readonly templates: ICRUDRepository<TemplateBase>,
    private readonly resources: ICRUDRepository<Resource>,
  ) {}

  /** Games of `gameParentId`, or all of them when omitted. */
  async list(gameParentId?: number): Promise<GameDto[]> {
    const rows: GameDto[] = []
    for await (const row of this.repo.read()) {
      if (row.isDeleted || (gameParentId !== undefined && Number(row.gameParentId) !== gameParentId)) continue
      rows.push(await this.toDto(row))
    }
    return rows
  }

  async get(id: number): Promise<GameDto | undefined> {
    const row = await this.find(id)
    return row ? this.toDto(row) : undefined
  }

  async create(input: GameInput): Promise<GameDto> {
    const parent = await this.parents.readSingleById(input.gameParentId)
    if (!parent || parent.isDeleted) throw new UnknownReferenceError(`unknown game parent: ${input.gameParentId}`)
    await this.check(input.templateId, input.imageId)

    const config = await this.configs.create(gameConfig({ templateId: input.templateId, imageId: input.imageId ?? null }))
    const row = await this.repo.create(
      game({
        name: input.name,
        description: input.description,
        gameParentId: input.gameParentId,
        gameConfigId: config.id,
        isEnabled: input.isEnabled ?? true,
        isDeleted: false,
        settings: { ...parent.settings, ...input.settings },
        categories: [],
      }),
    )
    return (await this.get(row.id))!
  }

  /** Merges the fields present in `input` into the stored game; undefined when it does not exist. */
  async update(id: number, input: Partial<Omit<GameInput, 'gameParentId'>>): Promise<GameDto | undefined> {
    const row = await this.find(id)
    if (!row) return undefined
    const config = await this.configs.readSingleById(row.gameConfigId)
    if (!config) throw new UnknownReferenceError(`game ${id} has no config`)

    await this.check(input.templateId ?? config.templateId, input.imageId)
    if (input.templateId !== undefined) config.templateId = input.templateId
    if (input.imageId !== undefined) config.imageId = input.imageId
    await this.configs.update(config)

    row.name = input.name ?? row.name
    row.description = input.description ?? row.description
    row.isEnabled = input.isEnabled ?? row.isEnabled
    if (input.settings) row.settings = { ...row.settings, ...input.settings }
    await this.repo.update(row)
    return this.get(id)
  }

  /** Games are referenced by game states and reviews, so deleting only flags them. */
  async delete(id: number): Promise<boolean> {
    const row = await this.find(id)
    if (!row) return false
    row.isDeleted = true
    await this.repo.update(row)
    return true
  }

  private async find(id: number): Promise<Game | undefined> {
    const row = await this.repo.readSingleById(id)
    return row && !row.isDeleted ? row : undefined
  }

  private async check(templateId: number, imageId?: number | null): Promise<void> {
    if (!(await this.templates.readSingleById(templateId))) throw new UnknownReferenceError(`unknown template: ${templateId}`)
    if (imageId != null) {
      const image = await this.resources.readSingleById(imageId)
      if (!image || image.isDeleted) throw new UnknownReferenceError(`unknown image: ${imageId}`)
    }
  }

  private async toDto(row: Game): Promise<GameDto> {
    const config = await this.configs.readSingleById(row.gameConfigId)
    return {
      id: Number(row.id),
      uuid: row.uuid,
      name: row.name,
      description: row.description,
      gameParentId: Number(row.gameParentId),
      templateId: Number(config?.templateId),
      imageId: config?.imageId == null ? null : Number(config.imageId),
      isEnabled: row.isEnabled,
      settings: row.settings,
      created: row.created,
      updated: row.updated,
    }
  }
}
