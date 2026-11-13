// schema-version: 1.0
/** View EmailAttributeMap. */
export const emailAttributeMap = (init: Partial<EmailAttributeMap>): EmailAttributeMap => Object.assign(new EmailAttributeMap(), init);
export class EmailAttributeMap {
  key: string = "";
  value: string = "";
}
