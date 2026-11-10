// schema-version: 1.0
/** Type GameConfig. */
export const gameConfig = (init: Partial<GameConfig>): GameConfig => Object.assign(new GameConfig(), init);
export class GameConfig {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  templateId!: number;
  imageId!: number | null;
}
