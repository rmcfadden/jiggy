// schema-version: 1.0
import type { Category } from "../datasource/category";
import type { GameInstanceBase } from "../datasource/gameInstanceBase";
/** View GameInstance. */
type Dictionary<K extends PropertyKey, V> = Record<K, V>;
export const gameInstance = (init: Partial<GameInstance>): GameInstance => ({ ...init } as GameInstance);
export interface GameInstance extends GameInstanceBase {
  settings: Dictionary<string, string>;
  categories: Category[];
}
