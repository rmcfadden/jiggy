// schema-version: 1.0
/** Type IdentityProviderType. */
export const identityProviderType = (init: Partial<IdentityProviderType>): IdentityProviderType => Object.assign(new IdentityProviderType(), init);
export class IdentityProviderType {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  description!: string | null;
}
