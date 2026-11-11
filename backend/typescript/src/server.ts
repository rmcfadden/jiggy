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
import type { Token } from '../generated/types/view/token.ts'
import type { TokenType } from '../generated/types/datasource/tokenType.ts'
import type { UserToken } from '../generated/types/datasource/userToken.ts'
import type { Session } from '../generated/types/view/session.ts'
import type { SessionHit } from '../generated/types/view/sessionHit.ts'
import type { SessionType } from '../generated/types/datasource/sessionType.ts'
import { createUsersService } from './cli/users.ts'
import { TokenService, tokenSettingsFromEnv } from './services/tokens.ts'
import { SessionService } from './services/sessions.ts'
import { SigninService } from './services/signin.ts'
import { OAuthService } from './services/oauth.ts'
import { signinRouter } from './routes/signin.ts'
import { oauthRouter } from './routes/oauth.ts'
import type { Contact } from '../generated/types/view/contact.ts'
import type { Email } from '../generated/types/view/email.ts'
import type { EmailType } from '../generated/types/datasource/emailType.ts'
import type { Gender } from '../generated/types/datasource/gender.ts'
import { SignupService } from './services/signup.ts'
import { signupRouter } from './routes/signup.ts'

const ds = Datasource.default as Datasource & {
  categories: ICRUDRepository<Category>
  games: ICRUDRepository<Game>
  gameCategories: ICRUDRepository<GameCategory>
  mimeTypes: ICRUDRepository<MimeType>
  resources: ICRUDRepository<Resource>
  gameParents: ICRUDRepository<GameParent>
  templates: ICRUDRepository<TemplateBase>
  templateTypes: ICRUDRepository<TemplateType>
  tokens: ICRUDRepository<Token>
  tokenTypes: ICRUDRepository<TokenType>
  userTokens: ICRUDRepository<UserToken>
  sessions: ICRUDRepository<Session>
  sessionHits: ICRUDRepository<SessionHit>
  sessionTypes: ICRUDRepository<SessionType>
  contacts: ICRUDRepository<Contact>
  emails: ICRUDRepository<Email>
  emailTypes: ICRUDRepository<EmailType>
  genders: ICRUDRepository<Gender>
}
const categories = new CategoriesService(ds.categories)
const gameParents = new GameParentsService(ds.gameParents)
const templates = new TemplatesService(ds.templates, ds.templateTypes)
const images = new ImagesService(ds.resources, ds.mimeTypes)
const games = new GamesService(ds.games, ds.gameCategories, categories, gameParents, templates, images)

const users = createUsersService()
const tokenSettings = tokenSettingsFromEnv()
const tokens = new TokenService(ds.tokens, ds.userTokens, ds.tokenTypes, tokenSettings)
const sessions = new SessionService(ds.sessions, ds.sessionHits, ds.sessionTypes, tokens)
const signin = new SigninService(users, tokens, ds.contacts, ds.emails)
const oauth = new OAuthService(users, tokens, sessions, tokenSettings)
const signup = new SignupService(users, tokens, ds.contacts, ds.emails, ds.emailTypes, ds.genders)

const summaries = new GameSummariesService(await ds.createConnection(), images, ds.games)

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
app.use('/api/signin', signinRouter(signin))
app.use('/api/oauth', oauthRouter(oauth))
app.use('/api/signup', signupRouter(signup))

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => console.log(`listening on :${port}`))
