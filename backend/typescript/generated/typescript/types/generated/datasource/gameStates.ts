// schema-version: 1.0
/** Type GameStates. */
export const gameStates = (init: Partial<GameStates>): GameStates => ({ ...init } as GameStates);
export class GameStates {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameId!: number;
  userId!: number;
  state!: string;
}
