// schema-version: 1.0
/** Type GamesCategories. */
export const gamesCategories = (init: Partial<GamesCategories>): GamesCategories => ({ ...init } as GamesCategories);
export class GamesCategories {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameId!: number;
  categoryId!: number;
}
