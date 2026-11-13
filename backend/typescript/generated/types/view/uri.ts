// schema-version: 1.0
/** View Uri. */
export const uri = (init: Partial<Uri>): Uri => Object.assign(new Uri(), init);
export class Uri {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  location: string = "";
  isPublic: boolean = false;
  isEnabled: boolean = true;
  isDeleted: boolean = false;
  uriTypeName: string = "";
  description!: string | null;
}
