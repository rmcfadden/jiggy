// schema-version: 1.0
/** Type SessionsBase. */
export const sessionsBase = (init: Partial<SessionsBase>): SessionsBase => Object.assign(new SessionsBase(), init);
export class SessionsBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  sessionTypeId!: number;
  userId!: number | null;
  relativeExpiration!: number | null;
  absoluteExpiration!: Date | null;
  revoked!: Date | null;
  expired!: Date | null;
  isEnabled: boolean = true;
}
