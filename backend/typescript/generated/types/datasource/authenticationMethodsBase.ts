// schema-version: 1.0
/** Type AuthenticationMethodsBase. */
export const authenticationMethodsBase = (init: Partial<AuthenticationMethodsBase>): AuthenticationMethodsBase => Object.assign(new AuthenticationMethodsBase(), init);
export class AuthenticationMethodsBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  description!: string | null;
  isDefault: boolean = true;
  isEnabled: boolean = true;
}
