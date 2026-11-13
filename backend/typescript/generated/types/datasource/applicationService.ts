// schema-version: 1.0
/** Type ApplicationService. */
export const applicationService = (init: Partial<ApplicationService>): ApplicationService => Object.assign(new ApplicationService(), init);
export class ApplicationService {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  applicationId!: number;
  serviceId!: number;
}
