// schema-version: 1.0
/** Type LogAttribute. */
export const logAttribute = (init: Partial<LogAttribute>): LogAttribute => Object.assign(new LogAttribute(), init);
export class LogAttribute {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  logId!: number;
  name: string = "";
  value: string = "";
}
