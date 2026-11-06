// schema-version: 1.0
import type { ResourceBase } from "../datasource/resourceBase";
/** View Resource. */
export const resource = (init: Partial<Resource>): Resource => ({ ...init } as Resource);
export interface Resource extends Omit<ResourceBase, "mimeTypeId"> {
  mimeTypeName: string;
}
