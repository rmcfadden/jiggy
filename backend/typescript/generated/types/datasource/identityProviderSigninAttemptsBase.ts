// schema-version: 1.0
/** Type IdentityProviderSigninAttemptsBase. */
export const identityProviderSigninAttemptsBase = (init: Partial<IdentityProviderSigninAttemptsBase>): IdentityProviderSigninAttemptsBase => Object.assign(new IdentityProviderSigninAttemptsBase(), init);
export class IdentityProviderSigninAttemptsBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  identityProviderId!: number;
  sessionId!: number;
  authenticationMethodId!: number;
  isSuccess: boolean = false;
}
