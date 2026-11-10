// schema-version: 1.0
/** View Template. */
export const template = (init: Partial<Template>): Template => Object.assign(new Template(), init);
export class Template {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  content: string = "";
  templateTypeName: string = "";
}
