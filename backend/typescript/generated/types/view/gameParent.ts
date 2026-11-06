// schema-version: 1.0
import type { Category } from "../datasource/category";
import type { GameParentBase } from "../datasource/gameParentBase";
/** View GameParent. */
type Dictionary<K extends PropertyKey, V> = Record<K, V>;
export const gameParent = (init: Partial<GameParent>): GameParent => ({ ...init } as GameParent);
export interface GameParent extends GameParentBase {
  settings: Dictionary<string, string>;
  categories: Category[];
}
