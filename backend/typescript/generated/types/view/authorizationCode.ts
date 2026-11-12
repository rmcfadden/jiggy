// schema-version: 1.0
/** View AuthorizationCode. */
export const authorizationCode = (init: Partial<AuthorizationCode>): AuthorizationCode => Object.assign(new AuthorizationCode(), init);
export class AuthorizationCode {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  sessionId!: number | null;
  code: string = "";
  isUsed: boolean = true;
  isDeleted: boolean = false;
}
