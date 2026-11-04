// schema-version: 1.0
import type { Group } from "../datasource/group";
import type { Role } from "../datasource/role";
import type { User } from "../datasource/user";
/** View Users. */
type Dictionary<K extends PropertyKey, V> = Record<K, V>;
export const users = (init: Partial<Users>): Users => ({ ...init } as Users);
export interface Users extends User {
  settings: Dictionary<string, string>;
  roles: Role[];
  groups: Group[];
}
