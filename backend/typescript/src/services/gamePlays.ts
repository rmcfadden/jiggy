import type { ICRUDRepository } from '@deterministic-code/datasources'
import { gamePlay, type GamePlay } from '../../generated/types/view/gamePlay.ts'
import { gamePlayAction, type GamePlayAction } from '../../generated/types/datasource/gamePlayAction.ts'
import { gamePlayState, type GamePlayState } from '../../generated/types/datasource/gamePlayState.ts'
import { gamePlayUser, type GamePlayUser } from '../../generated/types/datasource/gamePlayUser.ts'
import type { GamesService } from './games.ts'
import type { TemplatesService } from './templates.ts'
import { foldState } from './gameplay/puzzleGameService.ts'
import type { GameServiceRegistry } from './gameplay/registry.ts'
import { GameError, parseAction, type PuzzleState, type StateRow } from './gameplay/types.ts'

export type PlayDto = { id: number; gameId: number; finished: Date | null; state: PuzzleState }
/** An unfinished play to carry on with: `lastPlayed` is its newest state change (the start, when nothing was played yet). */
export type UnfinishedPlayDto = { id: number; gameId: number; lastPlayed: Date }
export type ActionDto = { id: number; userId: number; action: unknown; created: Date }

/**
 * Runs game plays: `start` creates a play with its first state, `action` hands a player's move to the game service
 * and stores the accepted result, `finish` closes the play. A play is read through the `game_play` view, which brings
 * its participants, state changes and actions in one fetch; writes go to the base repositories. Only this service
 * writes `game_play_state`, so a client can never set the state, only ask for moves the rules accept.
 */
export class GamePlaysService {
  /** Serialises writes per play so two moves cannot both be checked against the same state. */
  private readonly queues = new Map<number, Promise<unknown>>()

  constructor(
    private readonly plays: ICRUDRepository<GamePlay>,
    private readonly states: ICRUDRepository<GamePlayState>,
    private readonly actions: ICRUDRepository<GamePlayAction>,
    private readonly users: ICRUDRepository<GamePlayUser>,
    private readonly games: GamesService,
    private readonly templates: TemplatesService,
    private readonly registry: GameServiceRegistry,
  ) {}

  /** Starts a play of `gameId` for `userId`; the game's parent decides which game service runs it. */
  async start(gameId: number, userId: number): Promise<PlayDto> {
    const game = await this.games.get(gameId)
    if (!game) throw new GameError(404, `unknown game: ${gameId}`)
    const service = this.registry.forParent(game.parent)
    const content = (await this.templates.get(game.templateId))?.content as { cols?: number; rows?: number } | undefined
    const designer = (game.config as { config?: Record<string, unknown> } | undefined)?.config ?? {}
    const state = service.start({ cols: Number(content?.cols ?? 0), rows: Number(content?.rows ?? 0), config: designer })

    const play = await this.plays.create(gamePlay({ gameId, userId, finished: null }))
    const id = Number(play.id)
    await this.users.create(gamePlayUser({ gamePlayId: id, userId }))
    await this.states.create(gamePlayState({ gamePlayId: id, stateChange: JSON.stringify(state) }))
    return { id, gameId, finished: null, state }
  }

  /** Applies one action; throws 400 for a malformed one and 409 for one the rules refuse, storing nothing in both cases. */
  action(playId: number, userId: number, body: unknown) {
    const action = parseAction(body)
    return this.exclusive(playId, async () => {
      const play = await this.load(playId, userId)
      if (play.finished) throw new GameError(409, 'the play is finished')
      const state = this.stateOf(play)
      const result = this.registry.forParent(state.type).action(state, action)
      // The state row goes first: it is the truth. A failure before the action row leaves a state with no log entry, never a logged move that did not happen.
      const row: StateRow = { events: result.events, mistakes: result.state.mistakes, solved: result.state.solved }
      await this.states.create(gamePlayState({ gamePlayId: playId, stateChange: JSON.stringify(row) }))
      await this.actions.create(gamePlayAction({ gamePlayId: playId, userId, action: JSON.stringify(action) }))
      // Solving the puzzle ends the play: `finished` is set by the game, not by the client.
      let finished: Date | null = play.finished
      if (result.state.solved) finished = await this.markFinished(playId)
      return { accepted: result.result !== 'denied', result: result.result, reason: result.reason, correct: result.correct, solved: result.state.solved, finished, events: result.events, state: result.state }
    })
  }

  /** The user's plays that are not finished, newest activity first: plays they are a participant of (`game_play_user`). */
  async unfinished(userId: number): Promise<UnfinishedPlayDto[]> {
    const ids = new Set<number>()
    for await (const row of this.users.read()) if (Number(row.userId) === userId) ids.add(Number(row.gamePlayId))
    const found: UnfinishedPlayDto[] = []
    for (const id of ids) {
      const play = await this.plays.readSingleById(id)
      if (!play || play.finished) continue
      const times = play.states.map((s) => new Date(s.created).getTime())
      found.push({ id, gameId: Number(play.gameId), lastPlayed: new Date(Math.max(new Date(play.created).getTime(), ...times)) })
    }
    return found.sort((a, b) => b.lastPlayed.getTime() - a.lastPlayed.getTime() || b.id - a.id)
  }

  async state(playId: number, userId: number): Promise<PlayDto> {
    const play = await this.load(playId, userId)
    return { id: playId, gameId: Number(play.gameId), finished: play.finished, state: this.stateOf(play) }
  }

  async actionList(playId: number, userId: number): Promise<ActionDto[]> {
    const play = await this.load(playId, userId)
    return [...play.actions]
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((a) => ({ id: Number(a.id), userId: Number(a.userId), action: JSON.parse(a.action), created: a.created }))
  }

  /** Closes the play (a solved play is already closed). It may be finished early; `solved` in the result says which. */
  finish(playId: number, userId: number) {
    return this.exclusive(playId, async () => {
      const play = await this.load(playId, userId)
      const state = this.stateOf(play)
      const summary = this.registry.forParent(state.type).finish(state)
      // A play that already ended (solved) just reports its result; finishing is idempotent.
      const finished = play.finished ?? (await this.markFinished(playId))
      return { id: playId, finished, ...summary, state }
    })
  }

  /**
   * Sets `finished`. The play is read again first: updating the view repository also rewrites its child lists, so an
   * update made with a list loaded before this request's new rows would delete those rows.
   */
  private async markFinished(playId: number): Promise<Date> {
    const fresh = await this.plays.readSingleById(playId)
    if (!fresh) throw new GameError(404, `unknown play: ${playId}`)
    fresh.finished = new Date()
    await this.plays.update(fresh)
    return fresh.finished
  }

  /** The play with its users, states and actions; 404 when missing, 403 when `userId` is not a participant. */
  private async load(playId: number, userId: number): Promise<GamePlay> {
    const play = Number.isSafeInteger(playId) ? await this.plays.readSingleById(playId) : undefined
    if (!play) throw new GameError(404, `unknown play: ${playId}`)
    if (!play.users.some((u) => Number(u.id) === userId)) throw new GameError(403, 'you are not a player of this game')
    return play
  }

  private stateOf(play: GamePlay): PuzzleState {
    const ordered = [...play.states].sort((a, b) => Number(a.id) - Number(b.id))
    return foldState(ordered.map((s) => JSON.parse(s.stateChange) as Record<string, unknown>))
  }

  private exclusive<T>(playId: number, work: () => Promise<T>): Promise<T> {
    const run = (this.queues.get(playId) ?? Promise.resolve()).then(work, work)
    const tail = run.catch(() => undefined)
    this.queues.set(playId, tail)
    void tail.then(() => {
      if (this.queues.get(playId) === tail) this.queues.delete(playId)
    })
    return run
  }
}
