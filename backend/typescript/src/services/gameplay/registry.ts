import type { PuzzleGameService } from './puzzleGameService.ts'
import { LastXGameService, NextPiecesGameService } from './trayGameService.ts'
import { ScrambledGameService } from './scrambledGameService.ts'
import { GameError } from './types.ts'

/** Maps a parent game's `location` to the service that runs its games. */
export class GameServiceRegistry {
  private readonly services = new Map<string, PuzzleGameService>()

  constructor(services: PuzzleGameService[] = [new ScrambledGameService(), new NextPiecesGameService(), new LastXGameService()]) {
    for (const service of services) this.services.set(service.type, service)
  }

  /** The service for a parent `location`; throws 422 when no service runs that kind of game. */
  forParent(location: string): PuzzleGameService {
    const service = this.services.get(location)
    if (!service) throw new GameError(422, `no game service for "${location}"`)
    return service
  }
}
