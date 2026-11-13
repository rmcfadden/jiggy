// schema-version: 1.0
/** View PhoneAttributeMap. */
export const phoneAttributeMap = (init: Partial<PhoneAttributeMap>): PhoneAttributeMap => Object.assign(new PhoneAttributeMap(), init);
export class PhoneAttributeMap {
  key: string = "";
  value: string = "";
}
