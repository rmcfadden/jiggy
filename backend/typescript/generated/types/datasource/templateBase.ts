// schema-version: 1.0
/** Type TemplateBase. */
export const templateBase = (init: Partial<TemplateBase>): TemplateBase => Object.assign(new TemplateBase(), init);
export class TemplateBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  templateTypeId!: number;
  name: string = "";
  content: string = "";
}
