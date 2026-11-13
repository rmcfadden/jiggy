// schema-version: 1.0
/** Type Setting. */
export const setting = (init: Partial<Setting>): Setting => Object.assign(new Setting(), init);
export class Setting {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  appId!: number;
  name: string = "";
  value: string = "";
}
