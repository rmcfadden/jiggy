// schema-version: 1.0
/** Type ServiceUri. */
export const serviceUri = (init: Partial<ServiceUri>): ServiceUri => Object.assign(new ServiceUri(), init);
export class ServiceUri {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  serviceId!: number;
  uriId!: number;
}
