// schema-version: 1.0
/** View ContactAttributeMap. */
export const contactAttributeMap = (init: Partial<ContactAttributeMap>): ContactAttributeMap => Object.assign(new ContactAttributeMap(), init);
export class ContactAttributeMap {
  key: string = "";
  value: string = "";
}
