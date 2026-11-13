// schema-version: 1.0
import type { Category } from "../datasource/category";
/** View GameSummary. */
type Dictionary<K extends PropertyKey, V> = Record<K, V>;
export const gameSummary = (init: Partial<GameSummary>): GameSummary => Object.assign(new GameSummary(), init);
export class GameSummary {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  description: string = "";
  parentName: string = "";
  thumbnameLocation: string = "";
  categories: Category[] = [];
  attributes: Dictionary<string, string> = {};
}
