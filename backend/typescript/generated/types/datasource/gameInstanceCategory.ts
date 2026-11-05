// schema-version: 1.0
/** Type GameInstanceCategory. */
export const gameInstanceCategory = (init: Partial<GameInstanceCategory>): GameInstanceCategory => ({ ...init } as GameInstanceCategory);
export class GameInstanceCategory {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameInstanceId!: number;
  categoryId!: number;
}
