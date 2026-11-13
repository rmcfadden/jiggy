// schema-version: 1.0
/** Type EmailToken. */
export const emailToken = (init: Partial<EmailToken>): EmailToken => Object.assign(new EmailToken(), init);
export class EmailToken {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  emailId!: number;
  tokenId!: number;
}
