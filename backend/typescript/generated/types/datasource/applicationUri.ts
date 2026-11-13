// schema-version: 1.0
/** Type ApplicationUri. */
export const applicationUri = (init: Partial<ApplicationUri>): ApplicationUri => Object.assign(new ApplicationUri(), init);
export class ApplicationUri {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  applicationId!: number;
  uriId!: number;
}
