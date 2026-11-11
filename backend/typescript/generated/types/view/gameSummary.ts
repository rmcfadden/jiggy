// schema-version: 1.0
import type { Category } from "../datasource/category";
/** View GameSummary. */
type Dictionary<K extends PropertyKey, V> = Record<K, V>;
export const gameSummary = (init: Partial<GameSummary>): GameSummary => Object.assign(new GameSummary(), init);
export class GameSummary {
  id!: number;
  name: string = "";
  description: string = "";
  parentName: string = "";
  thumbnameLocation: string = "";
  categories: Category[] = [];
  attributes: Dictionary<string, string> = {};
}
