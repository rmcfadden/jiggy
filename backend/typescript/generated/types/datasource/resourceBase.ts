// schema-version: 1.0
/** Type ResourceBase. */
export const resourceBase = (init: Partial<ResourceBase>): ResourceBase => ({ ...init } as ResourceBase);
export class ResourceBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  resourceName!: string;
  mimeTypeId!: number;
  description!: string;
  location!: string;
  isEnabled: boolean = true;
  isDeleted!: boolean;
}
