// schema-version: 1.0
/** Type GameParentCategory. */
export const gameParentCategory = (init: Partial<GameParentCategory>): GameParentCategory => ({ ...init } as GameParentCategory);
export class GameParentCategory {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  gameParentId!: number;
  categoryId!: number;
}
