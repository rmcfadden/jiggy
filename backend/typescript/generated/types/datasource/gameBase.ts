// schema-version: 1.0
/** Type GameBase. */
export const gameBase = (init: Partial<GameBase>): GameBase => Object.assign(new GameBase(), init);
export class GameBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  description: string = "";
  gameParentId!: number;
  gameConfigId!: number;
  isDeleted: boolean = false;
  isEnabled: boolean = true;
}
