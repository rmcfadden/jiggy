// schema-version: 1.0
/** Type GameInstanceBase. */
export const gameInstanceBase = (init: Partial<GameInstanceBase>): GameInstanceBase => ({ ...init } as GameInstanceBase);
export class GameInstanceBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name!: string;
  description!: string;
  gameId!: number;
  gameConfigId!: number;
  isDeleted!: boolean;
  isEnabled: boolean = true;
}
