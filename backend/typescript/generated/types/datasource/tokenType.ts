// schema-version: 1.0
/** Type TokenType. */
export const tokenType = (init: Partial<TokenType>): TokenType => Object.assign(new TokenType(), init);
export class TokenType {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  description: string = "";
}
