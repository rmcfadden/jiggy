// schema-version: 1.0
/** Type StringBase. */
export const stringBase = (init: Partial<StringBase>): StringBase => ({ ...init } as StringBase);
export class StringBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  stringNameId!: number;
  languageId!: number;
  value!: string;
  isEnabled: boolean = true;
  isDeleted!: boolean;
}
