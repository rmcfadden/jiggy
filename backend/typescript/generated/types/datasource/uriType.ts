// schema-version: 1.0
/** Type UriType. */
export const uriType = (init: Partial<UriType>): UriType => Object.assign(new UriType(), init);
export class UriType {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name: string = "";
  description!: string | null;
}
