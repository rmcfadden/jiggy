// schema-version: 1.0
/** View IdentityProviderSigninAttempt. */
export const identityProviderSigninAttempt = (init: Partial<IdentityProviderSigninAttempt>): IdentityProviderSigninAttempt => Object.assign(new IdentityProviderSigninAttempt(), init);
export class IdentityProviderSigninAttempt {
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
