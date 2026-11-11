// schema-version: 1.0
/** Type SecretsBase. */
export const secretsBase = (init: Partial<SecretsBase>): SecretsBase => Object.assign(new SecretsBase(), init);
export class SecretsBase {
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
}
