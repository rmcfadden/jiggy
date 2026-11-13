// schema-version: 1.0
/** Type ServiceSettingsBase. */
export const serviceSettingsBase = (init: Partial<ServiceSettingsBase>): ServiceSettingsBase => Object.assign(new ServiceSettingsBase(), init);
export class ServiceSettingsBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  serviceId!: number;
  name: string = "";
  value: string = "";
}
