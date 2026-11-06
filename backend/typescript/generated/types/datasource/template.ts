// schema-version: 1.0
/** Type Template. */
export const template = (init: Partial<Template>): Template => ({ ...init } as Template);
export class Template {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  templateTypeId!: number;
  name!: string;
  content!: string;
}
