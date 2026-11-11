// schema-version: 1.0
/** View Token. */
export const token = (init: Partial<Token>): Token => Object.assign(new Token(), init);
export class Token {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  secret: string = "";
  isEnabled: boolean = true;
  expires!: Date;
  revoked!: Date | null;
  isDeleted: boolean = false;
  tokenTypeName: string = "";
  description: string = "";
}
