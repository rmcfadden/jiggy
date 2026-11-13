// schema-version: 1.0
/** View Application. */
export const application = (init: Partial<Application>): Application => Object.assign(new Application(), init);
export class Application {
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
