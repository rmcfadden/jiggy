// schema-version: 1.0
/** View GameParentSettingMap. */
export const gameParentSettingMap = (init: Partial<GameParentSettingMap>): GameParentSettingMap => Object.assign(new GameParentSettingMap(), init);
export class GameParentSettingMap {
  key: string = "";
  value: string = "";
}
