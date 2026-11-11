// schema-version: 1.0
/** Type SessionType. */
export const sessionType = (init: Partial<SessionType>): SessionType => Object.assign(new SessionType(), init);
export class SessionType {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
}
