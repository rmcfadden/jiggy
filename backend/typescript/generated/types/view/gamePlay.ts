// schema-version: 1.0
import type { GamePlayAction } from "../datasource/gamePlayAction";
import type { GamePlayState } from "../datasource/gamePlayState";
import type { User } from "./user";
/** View GamePlay. */
export const gamePlay = (init: Partial<GamePlay>): GamePlay => Object.assign(new GamePlay(), init);
export class GamePlay {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameId!: number;
  userId!: number;
  finished!: Date | null;
  states: GamePlayState[] = [];
  actions: GamePlayAction[] = [];
  users: User[] = [];
}
