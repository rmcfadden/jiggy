// schema-version: 1.0
/** View ServiceSetting. */
export const serviceSetting = (init: Partial<ServiceSetting>): ServiceSetting => Object.assign(new ServiceSetting(), init);
export class ServiceSetting {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  serviceId!: number;
  name: string = "";
  value: string = "";
}
