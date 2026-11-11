// schema-version: 1.0
/** Type UserToken. */
export const userToken = (init: Partial<UserToken>): UserToken => Object.assign(new UserToken(), init);
export class UserToken {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  userId!: number;
  tokenId!: number;
}
