// schema-version: 1.0
import type { GameBase } from "../datasource/gameBase";
/** View Game. */
type Dictionary<K extends PropertyKey, V> = Record<K, V>;
export const game = (init: Partial<Game>): Game => ({ ...init } as Game);
export interface Game extends GameBase {
  settings: Dictionary<string, string>;
}
