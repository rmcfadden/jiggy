// schema-version: 1.0
/** Type GameCategory. */
export const gameCategory = (init: Partial<GameCategory>): GameCategory => Object.assign(new GameCategory(), init);
export class GameCategory {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameId!: number;
  categoryId!: number;
}
