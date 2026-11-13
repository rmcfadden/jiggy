// schema-version: 1.0
/** View LogAttributeMap. */
export const logAttributeMap = (init: Partial<LogAttributeMap>): LogAttributeMap => Object.assign(new LogAttributeMap(), init);
export class LogAttributeMap {
  key: string = "";
  value: string = "";
}
