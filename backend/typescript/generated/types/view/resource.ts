// schema-version: 1.0
/** View Resource. */
export const resource = (init: Partial<Resource>): Resource => Object.assign(new Resource(), init);
export class Resource {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  resourceName: string = "";
  description: string = "";
  location: string = "";
  isEnabled: boolean = true;
  isDeleted: boolean = false;
  mimeTypeName: string = "";
}
