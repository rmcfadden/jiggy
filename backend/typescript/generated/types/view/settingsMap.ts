// schema-version: 1.0
/** View SettingsMap. */
export const settingsMap = (init: Partial<SettingsMap>): SettingsMap => Object.assign(new SettingsMap(), init);
export class SettingsMap {
  key: string = "";
  value: string = "";
}
