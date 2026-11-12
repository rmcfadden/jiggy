// schema-version: 1.0
/** Type IdentityProviderLinkedUsersBase. */
export const identityProviderLinkedUsersBase = (init: Partial<IdentityProviderLinkedUsersBase>): IdentityProviderLinkedUsersBase => Object.assign(new IdentityProviderLinkedUsersBase(), init);
export class IdentityProviderLinkedUsersBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  identityProviderId!: number;
  userId!: number;
  identityProviderLinkedUserFieldTypeId!: number;
  value: string = "";
}
