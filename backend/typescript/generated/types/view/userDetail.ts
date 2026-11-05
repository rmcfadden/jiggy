// schema-version: 1.0
import type { Group } from "../datasource/group";
import type { Role } from "../datasource/role";
import type { User } from "../datasource/user";
/** View UserDetail. */
type Dictionary<K extends PropertyKey, V> = Record<K, V>;
export const userDetail = (init: Partial<UserDetail>): UserDetail => ({ ...init } as UserDetail);
export interface UserDetail extends User {
  settings: Dictionary<string, string>;
  roles: Role[];
  groups: Group[];
}
