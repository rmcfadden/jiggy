// schema-version: 1.0
/** Type GameParentConfig. */
export const gameParentConfig = (init: Partial<GameParentConfig>): GameParentConfig => Object.assign(new GameParentConfig(), init);
export class GameParentConfig {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameParentId!: number;
  name: string = "";
  value: string = "";
}
