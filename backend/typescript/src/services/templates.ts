import { readFile } from 'node:fs/promises'
import type { ICRUDRepository } from '@deterministic-code/datasources'
import { templateBase, type TemplateBase } from '../../generated/types/datasource/templateBase.ts'
import type { Language } from '../../generated/types/datasource/language.ts'
import { templateType, type TemplateType } from '../../generated/types/datasource/templateType.ts'

/** What the API exchanges: `content` is the template's settings as JSON, stored as text. */
export type TemplateDto = { id: number; uuid: string; type: string; language: string; name: string; content: unknown; created: Date; updated: Date }
/** A template as the list returns it: without `content`, which `get` loads for the one that is selected. */
export type TemplateListItem = Omit<TemplateDto, 'content'>
/** `language` is an ISO 639-1 code and defaults to English. */
export type TemplateInput = { type: string; language?: string; name: string; content: unknown }

export const DEFAULT_LANGUAGE = 'en'

/** One entry of `backend/data/templates.json`. */
export type TemplateSeed = { type: string; language?: string; name: string; content: unknown }

/** The template types the designer ships with. */
export const TEMPLATE_TYPES = [
  { name: 'jigsaw', description: 'Jigsaw template settings' },
  { name: 'confirm_email', description: 'Email sent to confirm an address; content is JSON with subject, text and html using {{username}} and {{confirm_url}}' },
]

export class UnknownTemplateTypeError extends Error {}
export class UnknownLanguageError extends Error {}

export class TemplatesService {
  constructor(
    private readonly repo: ICRUDRepository<TemplateBase>,
    private readonly types: ICRUDRepository<TemplateType>,
    private readonly languages: ICRUDRepository<Language>,
  ) {}

  /** Templates of `type` (a template type name such as "jigsaw"), or all of them when omitted. */
  async list(type?: string): Promise<TemplateListItem[]> {
    const types = await this.typeNames()
    const codes = await this.languageCodes()
    const rows: TemplateListItem[] = []
    for await (const row of this.repo.read()) {
      if (!type || types.get(Number(row.templateTypeId)) === type) rows.push(toListItem(row, types, codes))
    }
    return rows
  }

  /** The content of the template of `type` (for example "confirm_email") written in `language` (an ISO 639-1 code). */
  async contentFor(type: string, language: string): Promise<unknown | undefined> {
    const types = await this.typeNames()
    const codes = await this.languageCodes()
    for await (const row of this.repo.read()) {
      if (types.get(Number(row.templateTypeId)) === type && codes.get(Number(row.languageId)) === language) return JSON.parse(row.content)
    }
    return undefined
  }

  async get(id: number): Promise<TemplateDto | undefined> {
    const row = await this.repo.readSingleById(id)
    return row ? toDto(row, await this.typeNames(), await this.languageCodes()) : undefined
  }

  async create(input: TemplateInput): Promise<TemplateDto> {
    const types = await this.typeNames()
    const codes = await this.languageCodes()
    const row = await this.repo.create(
      templateBase({
        templateTypeId: typeId(types, input.type),
        languageId: languageId(codes, input.language ?? DEFAULT_LANGUAGE),
        name: input.name,
        content: JSON.stringify(input.content),
      }),
    )
    return toDto((await this.repo.readSingleById(row.id)) ?? row, types, codes)
  }

  /** Merges the fields present in `input` into the stored row; undefined when it does not exist. */
  async update(id: number, input: Partial<TemplateInput>): Promise<TemplateDto | undefined> {
    const row = await this.repo.readSingleById(id)
    if (!row) return undefined
    const types = await this.typeNames()
    const codes = await this.languageCodes()
    if (input.type !== undefined) row.templateTypeId = typeId(types, input.type)
    if (input.language !== undefined) row.languageId = languageId(codes, input.language)
    if (input.name !== undefined) row.name = input.name
    if (input.content !== undefined) row.content = JSON.stringify(input.content)
    await this.repo.update(row)
    return toDto(row, types, codes)
  }

  async delete(id: number): Promise<boolean> {
    const row = await this.repo.readSingleById(id)
    if (!row) return false
    await this.repo.delete(row)
    return true
  }

  /**
   * Creates the templates in the seed file at `path` that are missing, matching on (type, language, name); existing rows are
   * never changed. Returns the names added.
   */
  /** Adds the built-in template types that are not there yet; returns the names it added. */
  async addTypes(): Promise<string[]> {
    const have = new Set((await this.typeNames()).values())
    const added: string[] = []
    for (const t of TEMPLATE_TYPES) {
      if (have.has(t.name)) continue
      await this.types.create(templateType(t))
      added.push(t.name)
    }
    return added
  }

  async addTemplates(path: string): Promise<string[]> {
    const seeds = JSON.parse(await readFile(path, 'utf8')) as TemplateSeed[]
    const present = new Set((await this.list()).map((t) => `${t.type}\u0000${t.language}\u0000${t.name}`))
    const added: string[] = []
    for (const seed of seeds) {
      if (present.has(`${seed.type}\u0000${seed.language ?? DEFAULT_LANGUAGE}\u0000${seed.name}`)) continue
      await this.create(seed)
      added.push(seed.name)
    }
    return added
  }

  private async languageCodes(): Promise<Map<number, string>> {
    const codes = new Map<number, string>()
    for await (const l of this.languages.read()) codes.set(Number(l.id), l.code)
    return codes
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

function languageId(codes: Map<number, string>, code: string): number {
  for (const [id, c] of codes) if (c === code) return id
  throw new UnknownLanguageError(`unknown language: ${code}`)
}

function toListItem(row: TemplateBase, types: Map<number, string>, codes: Map<number, string>): TemplateListItem {
  return {
    id: Number(row.id),
    uuid: row.uuid,
    type: types.get(Number(row.templateTypeId)) ?? '',
    language: codes.get(Number(row.languageId)) ?? '',
    name: row.name,
    created: row.created,
    updated: row.updated,
  }
}

const toDto = (row: TemplateBase, types: Map<number, string>, codes: Map<number, string>): TemplateDto => ({ ...toListItem(row, types, codes), content: JSON.parse(row.content) })
