// schema-version: 1.0
/** Type GameBase. */
export const gameBase = (init: Partial<GameBase>): GameBase => ({ ...init } as GameBase);
export class GameBase {
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
