// schema-version: 1.0
import type { Category } from "../datasource/category";
import type { GameAttribute } from "../datasource/gameAttribute";
/** View GameSummary. */
export const gameSummary = (init: Partial<GameSummary>): GameSummary => Object.assign(new GameSummary(), init);
export class GameSummary {
  id!: number;
  name: string = "";
  description: string = "";
  parentName: string = "";
  thumbnameLocation: string = "";
  categories: Category[] = [];
  attributes: GameAttribute[] = [];
}
