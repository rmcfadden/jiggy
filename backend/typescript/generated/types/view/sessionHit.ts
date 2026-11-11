// schema-version: 1.0
/** View SessionHit. */
export const sessionHit = (init: Partial<SessionHit>): SessionHit => Object.assign(new SessionHit(), init);
export class SessionHit {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  sessionId!: number;
  ipAddress: string = "";
}
