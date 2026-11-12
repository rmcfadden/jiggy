// schema-version: 1.0
/** Type GamePlayUser. */
export const gamePlayUser = (init: Partial<GamePlayUser>): GamePlayUser => Object.assign(new GamePlayUser(), init);
export class GamePlayUser {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gamePlayId!: number;
  userId!: number;
}
