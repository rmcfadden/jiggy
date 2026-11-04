// schema-version: 1.0
import type { Categories } from "../datasource/categories";
import type { GamesBase } from "../datasource/gamesBase";
/** View Games. */
type Dictionary<K extends PropertyKey, V> = Record<K, V>;
export const games = (init: Partial<Games>): Games => ({ ...init } as Games);
export interface Games extends GamesBase {
  settings: Dictionary<string, string>;
  categories: Categories[];
}
