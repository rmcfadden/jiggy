// schema-version: 1.0
/** View GameSettingMap. */
export const gameSettingMap = (init: Partial<GameSettingMap>): GameSettingMap => Object.assign(new GameSettingMap(), init);
export class GameSettingMap {
  key: string = "";
  value: string = "";
}
