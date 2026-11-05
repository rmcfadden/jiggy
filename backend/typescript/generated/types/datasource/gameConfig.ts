// schema-version: 1.0
/** Type GameConfig. */
export const gameConfig = (init: Partial<GameConfig>): GameConfig => ({ ...init } as GameConfig);
export class GameConfig {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameId!: number;
  name!: string;
  value!: string;
}
