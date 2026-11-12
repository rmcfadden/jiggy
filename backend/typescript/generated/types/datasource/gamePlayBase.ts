// schema-version: 1.0
/** Type GamePlayBase. */
export const gamePlayBase = (init: Partial<GamePlayBase>): GamePlayBase => Object.assign(new GamePlayBase(), init);
export class GamePlayBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameId!: number;
  userId!: number;
  finished!: Date | null;
}
