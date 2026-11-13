// schema-version: 1.0
/** View IdentityProvider. */
type Dictionary<K extends PropertyKey, V> = Record<K, V>;
export const identityProvider = (init: Partial<IdentityProvider>): IdentityProvider => Object.assign(new IdentityProvider(), init);
export class IdentityProvider {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  description!: string | null;
  isEnabled: boolean = true;
  isBuiltin: boolean = false;
  isDeleted: boolean = false;
  identityProviderTypeName: string = "";
  settings: Dictionary<string, string> = {};
}
