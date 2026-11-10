// schema-version: 1.0
/** View LocalizedString. */
export const localizedString = (init: Partial<LocalizedString>): LocalizedString => Object.assign(new LocalizedString(), init);
export class LocalizedString {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  value: string = "";
  isEnabled: boolean = true;
  isDeleted: boolean = false;
  name: string = "";
  languageName: string = "";
}
