// schema-version: 1.0
/** View Session. */
export const session = (init: Partial<Session>): Session => Object.assign(new Session(), init);
export class Session {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  userId!: number | null;
  relativeExpiration!: number | null;
  absoluteExpiration!: Date | null;
  revoked!: Date | null;
  expired!: Date | null;
  isEnabled: boolean = true;
  sessionTypeName: string = "";
}
