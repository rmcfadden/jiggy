// schema-version: 1.0
/** View GameAttributeMap. */
export const gameAttributeMap = (init: Partial<GameAttributeMap>): GameAttributeMap => Object.assign(new GameAttributeMap(), init);
export class GameAttributeMap {
  key: string = "";
  value: string = "";
}
