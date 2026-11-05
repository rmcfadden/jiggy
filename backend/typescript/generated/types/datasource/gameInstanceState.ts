// schema-version: 1.0
/** Type GameInstanceState. */
export const gameInstanceState = (init: Partial<GameInstanceState>): GameInstanceState => ({ ...init } as GameInstanceState);
export class GameInstanceState {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameInstanceId!: number;
  userId!: number;
  state!: string;
}
