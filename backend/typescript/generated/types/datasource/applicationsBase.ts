// schema-version: 1.0
/** Type ApplicationsBase. */
export const applicationsBase = (init: Partial<ApplicationsBase>): ApplicationsBase => Object.assign(new ApplicationsBase(), init);
export class ApplicationsBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  applicationTypeId!: number;
  applicationVisibilityId!: number;
  clientId: string = "";
  description!: string | null;
  isEnabled: boolean = true;
  isDeleted: boolean = false;
  isBuiltin: boolean = false;
}
