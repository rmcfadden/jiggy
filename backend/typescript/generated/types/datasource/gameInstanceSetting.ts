// schema-version: 1.0
/** Type GameInstanceSetting. */
export const gameInstanceSetting = (init: Partial<GameInstanceSetting>): GameInstanceSetting => ({ ...init } as GameInstanceSetting);
export class GameInstanceSetting {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameInstanceId!: number;
  name!: string;
  value!: string;
}
