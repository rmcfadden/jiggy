// schema-version: 1.0
/** View Service. */
export const service = (init: Partial<Service>): Service => Object.assign(new Service(), init);
export class Service {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  description!: string | null;
}
