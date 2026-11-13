// schema-version: 1.0
/** View AddressAttributeMap. */
export const addressAttributeMap = (init: Partial<AddressAttributeMap>): AddressAttributeMap => Object.assign(new AddressAttributeMap(), init);
export class AddressAttributeMap {
  key: string = "";
  value: string = "";
}
