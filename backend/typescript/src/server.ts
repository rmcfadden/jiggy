import '../generated/repositories/repositoryRegistry.ts'
import './datasources-register.ts'
import express from 'express'
import { Datasource, type ICRUDRepository } from '@deterministic-code/datasources'
import type { Category } from '../generated/types/view/category.ts'
import { categoriesRouter } from './routes/categories.ts'
import { CategoriesService } from './services/categories.ts'

const ds = Datasource.default as Datasource & { categories: ICRUDRepository<Category> }
const categories = new CategoriesService(ds.categories)

const app = express()
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/categories', categoriesRouter(categories))

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => console.log(`listening on :${port}`))
