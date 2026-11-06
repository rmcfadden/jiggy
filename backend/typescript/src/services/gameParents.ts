import type { ICRUDRepository } from '@deterministic-code/datasources'
import { gameParent, type GameParent } from '../../generated/types/view/gameParent.ts'

export type GameParentInput = Pick<GameParent, 'name' | 'description' | 'location'> & Partial<Pick<GameParent, 'isEnabled'>>

export class GameParentsService {
  constructor(private readonly repo: ICRUDRepository<GameParent>) {}

  async list(): Promise<GameParent[]> {
    const rows: GameParent[] = []
    for await (const row of this.repo.read()) if (!row.isDeleted) rows.push(row)
    return rows
  }

  async get(id: number): Promise<GameParent | undefined> {
    const row = await this.repo.readSingleById(id)
    return row && !row.isDeleted ? row : undefined
  }

  create(input: GameParentInput): Promise<GameParent> {
    return this.repo.create(gameParent({ settings: {}, categories: [], isEnabled: true, isDeleted: false, ...input }))
  }

  /** Merges `input` into the stored row; undefined when it does not exist. */
  async update(id: number, input: Partial<GameParentInput>): Promise<GameParent | undefined> {
    const row = await this.get(id)
    if (!row) return undefined
    const next = { ...row, ...input }
    await this.repo.update(next)
    return next
  }

  async delete(id: number): Promise<boolean> {
    const row = await this.get(id)
    if (!row) return false
    await this.repo.delete(row)
    return true
  }
}
