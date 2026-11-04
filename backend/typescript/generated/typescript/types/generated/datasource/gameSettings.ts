// schema-version: 1.0
/** Type GameSettings. */
export const gameSettings = (init: Partial<GameSettings>): GameSettings => ({ ...init } as GameSettings);
export class GameSettings {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameId!: number;
  name!: string;
  value!: string;
}
