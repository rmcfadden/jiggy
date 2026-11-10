// schema-version: 1.0
/** Type LocalizedStringBase. */
export const localizedStringBase = (init: Partial<LocalizedStringBase>): LocalizedStringBase => Object.assign(new LocalizedStringBase(), init);
export class LocalizedStringBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  localizedStringNameId!: number;
  languageId!: number;
  value: string = "";
  isEnabled: boolean = true;
  isDeleted: boolean = false;
}
