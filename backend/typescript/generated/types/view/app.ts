// schema-version: 1.0
/** View App. */
type Dictionary<K extends PropertyKey, V> = Record<K, V>;
export const app = (init: Partial<App>): App => Object.assign(new App(), init);
export class App {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  settings: Dictionary<string, string> = {};
}
