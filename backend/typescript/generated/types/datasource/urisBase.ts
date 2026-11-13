// schema-version: 1.0
/** Type UrisBase. */
export const urisBase = (init: Partial<UrisBase>): UrisBase => Object.assign(new UrisBase(), init);
export class UrisBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  uriTypeId!: number;
  location: string = "";
  isPublic: boolean = false;
  isEnabled: boolean = true;
  isDeleted: boolean = false;
}
