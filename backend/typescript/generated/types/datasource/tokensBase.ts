// schema-version: 1.0
/** Type TokensBase. */
export const tokensBase = (init: Partial<TokensBase>): TokensBase => Object.assign(new TokensBase(), init);
export class TokensBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  tokenTypeId!: number;
  name: string = "";
  secret: string = "";
  isEnabled: boolean = true;
  expires!: Date;
  revoked!: Date | null;
  isDeleted: boolean = false;
}
