// schema-version: 1.0
/** View IdentityProviderAuthorizeSession. */
export const identityProviderAuthorizeSession = (init: Partial<IdentityProviderAuthorizeSession>): IdentityProviderAuthorizeSession => Object.assign(new IdentityProviderAuthorizeSession(), init);
export class IdentityProviderAuthorizeSession {
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
