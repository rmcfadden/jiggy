// schema-version: 1.0
/** Type UserSecret. */
export const userSecret = (init: Partial<UserSecret>): UserSecret => Object.assign(new UserSecret(), init);
export class UserSecret {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  userId!: number;
  secretId!: number;
}
