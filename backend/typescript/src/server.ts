import '../generated/repositories/repositoryRegistry.ts'
import './datasources-register.ts'
import express from 'express'
import { Datasource, type ICRUDRepository } from '@deterministic-code/datasources'
import type { Category as Categories } from '../generated/types/view/category.ts'

type CategoryNode = { id: string; name: string; description: string; children: CategoryNode[] }

const ds = Datasource.default as Datasource & { categories: ICRUDRepository<Categories> }

const app = express()
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

/** Categories as a tree, where `id` is the lowercased name. */
function children(rows: Categories[], parent: number | null): CategoryNode[] {
  return rows
    .filter((c) => (c.categoryId == null ? null : Number(c.categoryId)) === parent)
    .map((c) => ({
      id: c.name.toLowerCase(),
      name: c.name,
      description: c.description,
      children: children(rows, Number(c.id)),
    }))
}

app.get('/api/categories', async (_req, res, next) => {
  try {
    const rows: Categories[] = []
    for await (const row of ds.categories.read()) rows.push(row)
    res.json(children(rows.filter((c) => c.isEnabled && !c.isDeleted), null))
  } catch (err) {
    next(err)
  }
})

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => console.log(`listening on :${port}`))
