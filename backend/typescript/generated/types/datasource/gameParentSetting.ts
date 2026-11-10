// schema-version: 1.0
/** Type GameParentSetting. */
export const gameParentSetting = (init: Partial<GameParentSetting>): GameParentSetting => Object.assign(new GameParentSetting(), init);
export class GameParentSetting {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameParentId!: number;
  name: string = "";
  value: string = "";
}
