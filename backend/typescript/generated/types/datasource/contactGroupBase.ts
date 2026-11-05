// schema-version: 1.0
/** Type ContactGroupBase. */
export const contactGroupBase = (init: Partial<ContactGroupBase>): ContactGroupBase => ({ ...init } as ContactGroupBase);
export class ContactGroupBase {
  id!: number;
  uuid: string = crypto.randomUUID();
  created: Date = new Date();
  updated: Date = new Date();
  version: string = Buffer.from([0]).toString("base64");
  name!: string;
  description!: string | null;
}
