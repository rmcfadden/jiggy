// schema-version: 1.0
/** View Log. */
type Dictionary<K extends PropertyKey, V> = Record<K, V>;
export const log = (init: Partial<Log>): Log => Object.assign(new Log(), init);
export class Log {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  message: string = "";
  logTypeName: string = "";
  attributes: Dictionary<string, string> = {};
}
