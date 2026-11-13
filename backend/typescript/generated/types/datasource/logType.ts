// schema-version: 1.0
/** Type LogType. */
export const logType = (init: Partial<LogType>): LogType => Object.assign(new LogType(), init);
export class LogType {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  description: string = "";
}
