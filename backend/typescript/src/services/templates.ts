import { readFile } from 'node:fs/promises'
import type { ICRUDRepository } from '@deterministic-code/datasources'
import { templateBase, type TemplateBase } from '../../generated/types/datasource/templateBase.ts'
import type { TemplateType } from '../../generated/types/datasource/templateType.ts'

/** What the API exchanges: `content` is the template's settings as JSON, stored as text. */
export type TemplateDto = { id: number; uuid: string; type: string; name: string; content: unknown; created: Date; updated: Date }
export type TemplateInput = { type: string; name: string; content: unknown }

/** One entry of `backend/data/templates.json`. */
export type TemplateSeed = { type: string; name: string; content: unknown }

export class UnknownTemplateTypeError extends Error {}

export class TemplatesService {
  constructor(
    private readonly repo: ICRUDRepository<TemplateBase>,
    private readonly types: ICRUDRepository<TemplateType>,
  ) {}

  /** Templates of `type` (a template type name such as "jigsaw"), or all of them when omitted. */
  async list(type?: string): Promise<TemplateDto[]> {
    const types = await this.typeNames()
    const rows: TemplateDto[] = []
    for await (const row of this.repo.read()) {
      if (!type || types.get(Number(row.templateTypeId)) === type) rows.push(toDto(row, types))
    }
    return rows
  }

  async get(id: number): Promise<TemplateDto | undefined> {
    const row = await this.repo.readSingleById(id)
    return row ? toDto(row, await this.typeNames()) : undefined
  }

  async create(input: TemplateInput): Promise<TemplateDto> {
    const types = await this.typeNames()
    const row = await this.repo.create(
      templateBase({ templateTypeId: typeId(types, input.type), name: input.name, content: JSON.stringify(input.content) }),
    )
    return toDto((await this.repo.readSingleById(row.id)) ?? row, types)
  }

  /** Merges the fields present in `input` into the stored row; undefined when it does not exist. */
  async update(id: number, input: Partial<TemplateInput>): Promise<TemplateDto | undefined> {
    const row = await this.repo.readSingleById(id)
    if (!row) return undefined
    const types = await this.typeNames()
    if (input.type !== undefined) row.templateTypeId = typeId(types, input.type)
    if (input.name !== undefined) row.name = input.name
    if (input.content !== undefined) row.content = JSON.stringify(input.content)
    await this.repo.update(row)
    return toDto(row, types)
  }

  async delete(id: number): Promise<boolean> {
    const row = await this.repo.readSingleById(id)
    if (!row) return false
    await this.repo.delete(row)
    return true
  }

  /**
   * Creates the templates in the seed file at `path` that are missing, matching on (type, name); existing rows are
   * never changed. Returns the names added.
   */
  async addTemplates(path: string): Promise<string[]> {
    const seeds = JSON.parse(await readFile(path, 'utf8')) as TemplateSeed[]
    const present = new Set((await this.list()).map((t) => `${t.type}\u0000${t.name}`))
    const added: string[] = []
    for (const seed of seeds) {
      if (present.has(`${seed.type}\u0000${seed.name}`)) continue
      await this.create(seed)
      added.push(seed.name)
    }
    return added
  }

  private async typeNames(): Promise<Map<number, string>> {
    const names = new Map<number, string>()
    for await (const t of this.types.read()) names.set(Number(t.id), t.name)
    return names
  }
}

function typeId(types: Map<number, string>, name: string): number {
  for (const [id, n] of types) if (n === name) return id
  throw new UnknownTemplateTypeError(`unknown template type: ${name}`)
}

function toDto(row: TemplateBase, types: Map<number, string>): TemplateDto {
  return {
    id: Number(row.id),
    uuid: row.uuid,
    type: types.get(Number(row.templateTypeId)) ?? '',
    name: row.name,
    content: JSON.parse(row.content),
    created: row.created,
    updated: row.updated,
  }
}
