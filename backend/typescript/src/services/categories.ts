import type { ICRUDRepository } from '@deterministic-code/datasources'
import { category, type Category } from '../../generated/types/view/category.ts'
import { slug } from './slug.ts'

/** One entry of `backend/data/categories.json`; roots may list children. */
export type CategorySeed = { name: string; description?: string; children?: CategorySeed[] }

export type CategoryNode = { id: string; name: string; description: string; children: CategoryNode[] }

/** A category with its database ids (the tree uses lowercased names instead). */
export type CategoryRow = { id: number; parentId: number | null; name: string; description: string }

export class CategoriesService {
  constructor(private readonly repo: ICRUDRepository<Category>) {}

  /** Categories as a tree, where `id` is the lowercased name. */
  async tree(): Promise<CategoryNode[]> {
    const rows: Category[] = []
    for await (const row of this.repo.read()) rows.push(row)
    return children(rows.filter((c) => c.isEnabled && !c.isDeleted), null)
  }

  /** Every live category as a flat list with database ids; `parentId` is null for roots. */
  async flat(): Promise<CategoryRow[]> {
    const rows: CategoryRow[] = []
    for await (const c of this.repo.read()) {
      if (c.isEnabled && !c.isDeleted) rows.push({ id: Number(c.id), parentId: c.categoryId == null ? null : Number(c.categoryId), name: c.name, description: c.description })
    }
    return rows
  }

  /**
   * The live category whose name has this slug, with the ids of its descendants; undefined when there is none.
   * Names are unique, so there is at most one.
   */
  async findBySlug(name: string): Promise<{ row: CategoryRow; ids: number[] } | undefined> {
    const rows = await this.flat()
    const row = rows.find((c) => slug(c.name) === name)
    if (!row) return undefined
    const ids = [row.id]
    for (let i = 0; i < ids.length; i++) for (const c of rows) if (c.parentId === ids[i]) ids.push(c.id)
    return { row, ids }
  }

  /**
   * Adds the seeds that are not there yet, matching on name and parent (deleted rows count, so a removed
   * category is not brought back); returns the names it added.
   */
  async addCategories(seeds: CategorySeed[]): Promise<string[]> {
    const rows: Category[] = []
    for await (const row of this.repo.read()) rows.push(row)
    const added: string[] = []
    const ensure = async (seed: CategorySeed, parent: number | null): Promise<number> => {
      const found = rows.find(
        (c) => (c.categoryId == null ? null : Number(c.categoryId)) === parent && c.name.toLowerCase() === seed.name.toLowerCase(),
      )
      if (found) return Number(found.id)
      const created = await this.repo.create(category({ categoryId: parent, name: seed.name, description: seed.description ?? '' }))
      rows.push(created)
      added.push(seed.name)
      return Number(created.id)
    }
    for (const root of seeds) {
      const parent = await ensure(root, null)
      for (const child of root.children ?? []) await ensure(child, parent)
    }
    return added
  }
}

function children(rows: Category[], parent: number | null): CategoryNode[] {
  return rows
    .filter((c) => (c.categoryId == null ? null : Number(c.categoryId)) === parent)
    .map((c) => ({
      id: c.name.toLowerCase(),
      name: c.name,
      description: c.description,
      children: children(rows, Number(c.id)),
    }))
}
