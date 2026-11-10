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
import type { PuzzleGame } from '../generated/types/datasource/puzzleGame.ts'
import type { GameCategory } from '../generated/types/datasource/gameCategory.ts'
import type { MimeType } from '../generated/types/datasource/mimeType.ts'
import type { Resource } from '../generated/types/view/resource.ts'
import { imagesRouter } from './routes/images.ts'
import { ImagesService } from './services/images.ts'
import { gamesRouter } from './routes/games.ts'
import { GamesService } from './services/games.ts'
import { gameSummariesRouter } from './routes/gameSummaries.ts'
import { GameSummariesService } from './services/gameSummaries.ts'
import { templatesRouter } from './routes/templates.ts'
import { TemplatesService } from './services/templates.ts'

const ds = Datasource.default as Datasource & {
  categories: ICRUDRepository<Category>
  games: ICRUDRepository<Game>
  puzzleGames: ICRUDRepository<PuzzleGame>
  gameCategories: ICRUDRepository<GameCategory>
  mimeTypes: ICRUDRepository<MimeType>
  resources: ICRUDRepository<Resource>
  gameParents: ICRUDRepository<GameParent>
  templates: ICRUDRepository<TemplateBase>
  templateTypes: ICRUDRepository<TemplateType>
}
const categories = new CategoriesService(ds.categories)
const gameParents = new GameParentsService(ds.gameParents)
const templates = new TemplatesService(ds.templates, ds.templateTypes)
const images = new ImagesService(ds.resources, ds.mimeTypes)
const games = new GamesService(ds.games, ds.puzzleGames, ds.gameCategories, categories, gameParents, templates, images)

const summaries = new GameSummariesService(await ds.createConnection(), images)

const app = express()
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/categories', categoriesRouter(categories))
app.use('/api/games_parents', gameParentsRouter(gameParents))
app.use('/api/games', gamesRouter(games))
app.use('/api/games_summaries', gameSummariesRouter(summaries))
app.use('/api/templates', templatesRouter(templates))
app.use('/api/images', imagesRouter(images))

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => console.log(`listening on :${port}`))
