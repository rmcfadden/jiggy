// schema-version: 1.0
/** Type GameAttribute. */
export const gameAttribute = (init: Partial<GameAttribute>): GameAttribute => Object.assign(new GameAttribute(), init);
export class GameAttribute {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameId!: number;
  name: string = "";
  value: string = "";
}
