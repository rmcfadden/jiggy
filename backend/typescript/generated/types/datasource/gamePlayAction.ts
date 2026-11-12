// schema-version: 1.0
/** Type GamePlayAction. */
export const gamePlayAction = (init: Partial<GamePlayAction>): GamePlayAction => Object.assign(new GamePlayAction(), init);
export class GamePlayAction {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gamePlayId!: number;
  userId!: number;
  action: string = "";
}
