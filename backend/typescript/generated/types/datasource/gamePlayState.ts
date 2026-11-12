// schema-version: 1.0
/** Type GamePlayState. */
export const gamePlayState = (init: Partial<GamePlayState>): GamePlayState => Object.assign(new GamePlayState(), init);
export class GamePlayState {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gamePlayId!: number;
  stateChange: string = "";
}
