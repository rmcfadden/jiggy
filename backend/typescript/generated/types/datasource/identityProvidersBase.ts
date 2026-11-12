// schema-version: 1.0
/** Type IdentityProvidersBase. */
export const identityProvidersBase = (init: Partial<IdentityProvidersBase>): IdentityProvidersBase => Object.assign(new IdentityProvidersBase(), init);
export class IdentityProvidersBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  identityProviderTypeId!: number;
  name: string = "";
  description!: string | null;
  isEnabled: boolean = true;
  isBuiltin: boolean = false;
  isDeleted: boolean = false;
}
