// schema-version: 1.0
/** Type AuthorizationCodesBase. */
export const authorizationCodesBase = (init: Partial<AuthorizationCodesBase>): AuthorizationCodesBase => Object.assign(new AuthorizationCodesBase(), init);
export class AuthorizationCodesBase {
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
