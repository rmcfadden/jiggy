// schema-version: 1.0
/** Type IdentityProviderSettingsBase. */
export const identityProviderSettingsBase = (init: Partial<IdentityProviderSettingsBase>): IdentityProviderSettingsBase => Object.assign(new IdentityProviderSettingsBase(), init);
export class IdentityProviderSettingsBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  identityProviderId!: number;
  name: string = "";
  value: string = "";
}
