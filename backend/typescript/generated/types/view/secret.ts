// schema-version: 1.0
/** View Secret. */
export const secret = (init: Partial<Secret>): Secret => Object.assign(new Secret(), init);
export class Secret {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  secretTypeId!: number;
  value: string = "";
  expires!: Date | null;
  isEnabled: boolean = true;
  isDeleted: boolean = false;
  secretTypeName: string = "";
  description!: string | null;
}
