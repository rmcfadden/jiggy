// schema-version: 1.0
/** Type ApplicationUser. */
export const applicationUser = (init: Partial<ApplicationUser>): ApplicationUser => Object.assign(new ApplicationUser(), init);
export class ApplicationUser {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  applicationId!: number;
  userId!: number;
}
