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
import type { Language } from '../generated/types/datasource/language.ts'
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
import type { EmailToken } from '../generated/types/datasource/emailToken.ts'
import type { Log } from '../generated/types/view/log.ts'
import { LogsService } from './services/logs.ts'
import { EmailService } from './services/email.ts'
import { EmailConfirmationService } from './services/emailConfirmation.ts'
import { emailsRouter } from './routes/emails.ts'
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
import type { GamePlay } from '../generated/types/view/gamePlay.ts'
import type { GamePlayState } from '../generated/types/datasource/gamePlayState.ts'
import type { GamePlayAction } from '../generated/types/datasource/gamePlayAction.ts'
import type { GamePlayUser } from '../generated/types/datasource/gamePlayUser.ts'
import { GamePlaysService } from './services/gamePlays.ts'
import { GameServiceRegistry } from './services/gameplay/registry.ts'
import { gamePlaysRouter } from './routes/gamePlays.ts'
import { requireAuth } from './middleware/auth.ts'
import type { Review } from '../generated/types/datasource/review.ts'
import type { GameReview } from '../generated/types/datasource/gameReview.ts'
import { ReviewsService } from './services/reviews.ts'
import { reviewsRouter } from './routes/reviews.ts'
import { puzzlesRouter } from './routes/puzzles.ts'

const ds = Datasource.default as Datasource & {
  categories: ICRUDRepository<Category>
  games: ICRUDRepository<Game>
  gameCategories: ICRUDRepository<GameCategory>
  mimeTypes: ICRUDRepository<MimeType>
  resources: ICRUDRepository<Resource>
  gameParents: ICRUDRepository<GameParent>
  templates: ICRUDRepository<TemplateBase>
  templateTypes: ICRUDRepository<TemplateType>
  languages: ICRUDRepository<Language>
  tokens: ICRUDRepository<Token>
  tokenTypes: ICRUDRepository<TokenType>
  userTokens: ICRUDRepository<UserToken>
  emailTokens: ICRUDRepository<EmailToken>
  logs: ICRUDRepository<Log>
  sessions: ICRUDRepository<Session>
  sessionHits: ICRUDRepository<SessionHit>
  sessionTypes: ICRUDRepository<SessionType>
  contacts: ICRUDRepository<Contact>
  emails: ICRUDRepository<Email>
  emailTypes: ICRUDRepository<EmailType>
  genders: ICRUDRepository<Gender>
  gamePlays: ICRUDRepository<GamePlay>
  gamePlayStates: ICRUDRepository<GamePlayState>
  gamePlayActions: ICRUDRepository<GamePlayAction>
  gamePlayUsers: ICRUDRepository<GamePlayUser>
  reviews: ICRUDRepository<Review>
  gameReviews: ICRUDRepository<GameReview>
}
const categories = new CategoriesService(ds.categories)
const gameParents = new GameParentsService(ds.gameParents)
const templates = new TemplatesService(ds.templates, ds.templateTypes, ds.languages)
const images = new ImagesService(ds.resources, ds.mimeTypes)
const games = new GamesService(ds.games, ds.gameCategories, categories, gameParents, templates, images)

const users = createUsersService()
const tokenSettings = tokenSettingsFromEnv()
const tokens = new TokenService(ds.tokens, ds.userTokens, ds.emailTokens, ds.tokenTypes, tokenSettings)
const sessions = new SessionService(ds.sessions, ds.sessionHits, ds.sessionTypes, tokens)
const signin = new SigninService(users, tokens, ds.contacts, ds.emails)
const oauth = new OAuthService(users, tokens, sessions, tokenSettings)
const logs = new LogsService(ds.logs)
const mail = new EmailService(logs)
const confirmations = new EmailConfirmationService(tokens, users, templates, ds.emails, ds.contacts, mail, logs, process.env.SITE_BASE_URL)
const signup = new SignupService(users, tokens, ds.contacts, ds.emails, ds.emailTypes, ds.genders, confirmations)

const gamePlays = new GamePlaysService(ds.gamePlays, ds.gamePlayStates, ds.gamePlayActions, ds.gamePlayUsers, games, templates, new GameServiceRegistry())

const reviews = new ReviewsService(ds.reviews, ds.gameReviews, games, users)

const summaries = new GameSummariesService(await ds.createConnection(), images, ds.games)

const app = express()
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/categories', categoriesRouter(categories))
app.use('/api/games_parents', gameParentsRouter(gameParents))
app.use('/api/games', gamesRouter(games))
app.use('/api', puzzlesRouter(games))
app.use('/api/games_summaries', gameSummariesRouter(summaries, reviews))
app.use('/api/templates', templatesRouter(templates))
app.use('/api/images', imagesRouter(images))
app.use('/api/signin', signinRouter(signin))
app.use('/api/oauth', oauthRouter(oauth))
app.use('/api/signup', signupRouter(signup))
app.use('/api/emails', emailsRouter(confirmations, requireAuth(tokens)))
app.use('/api/reviews', reviewsRouter(reviews, requireAuth(tokens)))
app.use('/api/game_plays', requireAuth(tokens), gamePlaysRouter(gamePlays))

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => console.log(`listening on :${port}`))
