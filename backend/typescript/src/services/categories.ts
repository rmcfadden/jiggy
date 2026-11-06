import type { ICRUDRepository } from '@deterministic-code/datasources'
import type { Category } from '../../generated/types/view/category.ts'

export type CategoryNode = { id: string; name: string; description: string; children: CategoryNode[] }

export class CategoriesService {
  constructor(private readonly repo: ICRUDRepository<Category>) {}

  /** Categories as a tree, where `id` is the lowercased name. */
  async tree(): Promise<CategoryNode[]> {
    const rows: Category[] = []
    for await (const row of this.repo.read()) rows.push(row)
    return children(rows.filter((c) => c.isEnabled && !c.isDeleted), null)
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
