import '../generated/repositories/repositoryRegistry.ts'
import './datasources-register.ts'
import express from 'express'
import { Datasource, type ICRUDRepository } from '@deterministic-code/datasources'
import type { Category } from '../generated/types/view/category.ts'
import type { GameParent } from '../generated/types/view/gameParent.ts'
import { categoriesRouter } from './routes/categories.ts'
import { CategoriesService } from './services/categories.ts'
import { gameParentsRouter } from './routes/gameParents.ts'
import { GameParentsService } from './services/gameParents.ts'
import type { TemplateBase } from '../generated/types/datasource/templateBase.ts'
import type { TemplateType } from '../generated/types/datasource/templateType.ts'
import type { Game } from '../generated/types/view/game.ts'
import type { GameConfig } from '../generated/types/datasource/gameConfig.ts'
import type { Resource } from '../generated/types/view/resource.ts'
import { gamesRouter } from './routes/games.ts'
import { GamesService } from './services/games.ts'
import { templatesRouter } from './routes/templates.ts'
import { TemplatesService } from './services/templates.ts'

const ds = Datasource.default as Datasource & {
  categories: ICRUDRepository<Category>
  games: ICRUDRepository<Game>
  gameConfigs: ICRUDRepository<GameConfig>
  resources: ICRUDRepository<Resource>
  gameParents: ICRUDRepository<GameParent>
  templates: ICRUDRepository<TemplateBase>
  templateTypes: ICRUDRepository<TemplateType>
}
const categories = new CategoriesService(ds.categories)
const gameParents = new GameParentsService(ds.gameParents)
const templates = new TemplatesService(ds.templates, ds.templateTypes)
const games = new GamesService(ds.games, ds.gameConfigs, ds.gameParents, ds.templates, ds.resources)

const app = express()
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/categories', categoriesRouter(categories))
app.use('/api/games_parents', gameParentsRouter(gameParents))
app.use('/api/games', gamesRouter(games))
app.use('/api/templates', templatesRouter(templates))

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => console.log(`listening on :${port}`))
