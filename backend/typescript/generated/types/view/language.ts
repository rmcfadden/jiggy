// schema-version: 1.0
/** View Language. */
export const language = (init: Partial<Language>): Language => Object.assign(new Language(), init);
export class Language {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  code: string = "";
  name: string = "";
  isEnabled: boolean = true;
  isDeleted: boolean = false;
}
