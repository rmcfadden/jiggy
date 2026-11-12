// schema-version: 1.0
/** View IdentityProviderSetting. */
export const identityProviderSetting = (init: Partial<IdentityProviderSetting>): IdentityProviderSetting => Object.assign(new IdentityProviderSetting(), init);
export class IdentityProviderSetting {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  identityProviderId!: number;
  name: string = "";
  value: string = "";
}
