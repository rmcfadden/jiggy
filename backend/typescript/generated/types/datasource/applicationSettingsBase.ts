// schema-version: 1.0
/** Type ApplicationSettingsBase. */
export const applicationSettingsBase = (init: Partial<ApplicationSettingsBase>): ApplicationSettingsBase => Object.assign(new ApplicationSettingsBase(), init);
export class ApplicationSettingsBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  applicationId!: number;
  name: string = "";
  value: string = "";
}
