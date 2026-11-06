// schema-version: 1.0
/** Type GameParentBase. */
export const gameParentBase = (init: Partial<GameParentBase>): GameParentBase => ({ ...init } as GameParentBase);
export class GameParentBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name!: string;
  description!: string;
  location!: string;
  isEnabled: boolean = true;
  isDeleted!: boolean;
}
