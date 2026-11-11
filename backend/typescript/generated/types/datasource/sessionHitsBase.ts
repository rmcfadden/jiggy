// schema-version: 1.0
/** Type SessionHitsBase. */
export const sessionHitsBase = (init: Partial<SessionHitsBase>): SessionHitsBase => Object.assign(new SessionHitsBase(), init);
export class SessionHitsBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  sessionId!: number;
  ipAddress: string = "";
}
