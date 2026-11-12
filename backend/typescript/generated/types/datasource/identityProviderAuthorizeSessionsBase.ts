// schema-version: 1.0
/** Type IdentityProviderAuthorizeSessionsBase. */
export const identityProviderAuthorizeSessionsBase = (init: Partial<IdentityProviderAuthorizeSessionsBase>): IdentityProviderAuthorizeSessionsBase => Object.assign(new IdentityProviderAuthorizeSessionsBase(), init);
export class IdentityProviderAuthorizeSessionsBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  identityProviderId!: number;
  sessionId!: number;
  redirectUri: string = "";
  state: string = "";
  codeChallenge: string = "";
  codeChallengeMethod: string = "";
  revoked!: Date | null;
  finished!: Date | null;
  isDeleted: boolean = false;
}
