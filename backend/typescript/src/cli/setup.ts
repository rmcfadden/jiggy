import { Datasource, type ICRUDRepository } from '@deterministic-code/datasources'
import type { GameParent } from '../../generated/types/view/gameParent.ts'
import { GameParentsService } from '../services/gameParents.ts'

/** The game types the designer ships with; `location` is the id the frontend matches on. */
export const GAME_PARENTS = [
  { name: 'Scrambled pieces', description: 'Every piece starts in the tray, shuffled.', location: 'scrambled' },
  { name: 'Next pieces in panel', description: 'The panel only offers the next few pieces.', location: 'next-pieces' },
  { name: 'Solve last X pieces', description: 'The puzzle starts nearly done; finish the last few.', location: 'last-x' },
]

/** Adds the built-in parent games that are not there yet; returns the names it added. */
export async function addParentGames(service: GameParentsService): Promise<string[]> {
  const have = new Set((await service.list()).map((g) => g.location))
  const added: string[] = []
  for (const game of GAME_PARENTS) {
    if (have.has(game.location)) continue
    await service.create(game)
    added.push(game.name)
  }
  return added
}

export async function setup(): Promise<void> {
  const ds = Datasource.default as Datasource & { gameParents: ICRUDRepository<GameParent> }
  const added = await addParentGames(new GameParentsService(ds.gameParents))
  console.log(added.length ? `added parent games: ${added.join(', ')}` : 'parent games already present')
}
