// schema-version: 1.0
/** View UserSettingMap. */
export const userSettingMap = (init: Partial<UserSettingMap>): UserSettingMap => Object.assign(new UserSettingMap(), init);
export class UserSettingMap {
  key: string = "";
  value: string = "";
}
