// schema-version: 1.0
/** View IdentityProviderSettingMap. */
export const identityProviderSettingMap = (init: Partial<IdentityProviderSettingMap>): IdentityProviderSettingMap => Object.assign(new IdentityProviderSettingMap(), init);
export class IdentityProviderSettingMap {
  key: string = "";
  value: string = "";
}
