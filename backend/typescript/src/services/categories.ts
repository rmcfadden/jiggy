import type { ICRUDRepository } from '@deterministic-code/datasources'
import { category, type Category } from '../../generated/types/view/category.ts'

/** One entry of `backend/data/categories.json`; roots may list children. */
export type CategorySeed = { name: string; description?: string; children?: CategorySeed[] }

export type CategoryNode = { id: string; name: string; description: string; children: CategoryNode[] }

export class CategoriesService {
  constructor(private readonly repo: ICRUDRepository<Category>) {}

  /** Categories as a tree, where `id` is the lowercased name. */
  async tree(): Promise<CategoryNode[]> {
    const rows: Category[] = []
    for await (const row of this.repo.read()) rows.push(row)
    return children(rows.filter((c) => c.isEnabled && !c.isDeleted), null)
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
