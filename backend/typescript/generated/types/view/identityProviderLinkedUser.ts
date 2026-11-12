// schema-version: 1.0
/** View IdentityProviderLinkedUser. */
export const identityProviderLinkedUser = (init: Partial<IdentityProviderLinkedUser>): IdentityProviderLinkedUser => Object.assign(new IdentityProviderLinkedUser(), init);
export class IdentityProviderLinkedUser {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  identityProviderId!: number;
  userId!: number;
  value: string = "";
  identityProviderLinkedUserFieldTypeName: string = "";
}
