// schema-version: 1.0
/** Type ServicesBase. */
export const servicesBase = (init: Partial<ServicesBase>): ServicesBase => Object.assign(new ServicesBase(), init);
export class ServicesBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  description!: string | null;
}
