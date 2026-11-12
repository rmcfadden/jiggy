// schema-version: 1.0
/** Type IdentityProviderLinkedUserFieldType. */
export const identityProviderLinkedUserFieldType = (init: Partial<IdentityProviderLinkedUserFieldType>): IdentityProviderLinkedUserFieldType => Object.assign(new IdentityProviderLinkedUserFieldType(), init);
export class IdentityProviderLinkedUserFieldType {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
}
