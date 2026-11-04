import type { Users } from "../types/generated/views/users";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { UserSettingsRepository } from "./userSettingsRepository";
import { RoleRepository } from "./roleRepository";
import { UserRoleRepository } from "./userRoleRepository";
import { GroupRepository } from "./groupRepository";
import { UserGroupRepository } from "./userGroupRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Users>()
    .add({ entity: "Users", entityMapper: new DictionaryMapper([["Users", "users"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"]]), ids: ["id"], createProperties: ["username", "password", "isEnabled"], updateProperties: ["uuid", "username", "password", "isEnabled"], readProperties: ["id", "uuid", "created", "updated", "version", "username", "password", "isEnabled"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, username: { type: "string", nullable: false, hasDefault: false }, password: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true } }) })
    .add("sqlite", { entity: "Users", entityMapper: new DictionaryMapper([["Users", "users"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "username", "password", "isEnabled"], updateProperties: ["uuid", "created", "version", "username", "password", "isEnabled"], readProperties: ["id", "uuid", "created", "updated", "version", "username", "password", "isEnabled"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, username: { type: "string", nullable: false, hasDefault: false }, password: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Users>()
    .add({ entity: "Users", entityMapper: new DictionaryMapper([["Users", "users"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"]]), readProperties: ["id", "uuid", "created", "updated", "version", "username", "password", "isEnabled"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, username: { type: "string", nullable: false, hasDefault: false }, password: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true } }) })
    .add("sqlite", { entity: "Users", entityMapper: new DictionaryMapper([["Users", "users"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"]]), readProperties: ["id", "uuid", "created", "updated", "version", "username", "password", "isEnabled"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, username: { type: "string", nullable: false, hasDefault: false }, password: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true } }) })
    .for(connection);

export class UsersRepository extends CRUDRepository<Users> {
  readonly userSettings: UserSettingsRepository;
  readonly role: RoleRepository;
  readonly userRole: UserRoleRepository;
  readonly group: GroupRepository;
  readonly userGroup: UserGroupRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.userSettings = new UserSettingsRepository(connection);
    this.role = new RoleRepository(connection);
    this.userRole = new UserRoleRepository(connection);
    this.group = new GroupRepository(connection);
    this.userGroup = new UserGroupRepository(connection);
    this.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "userId", relatedProperty: "value", type: "dictionary" }, this.userSettings);
    this.addLinked({ destinationProperty: "roles", sourceProperty: "id", relatedKey: "id", association: { parent: "userId", related: "roleId" }, type: "list" }, this.role, this.userRole);
    this.addLinked({ destinationProperty: "groups", sourceProperty: "id", relatedKey: "id", association: { parent: "userId", related: "groupId" }, type: "list" }, this.group, this.userGroup);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<Users>(connection, readonlyOptions(connection));
    const userSettings = new UserSettingsRepository(connection);
    const role = new RoleRepository(connection);
    const userRole = new UserRoleRepository(connection);
    const group = new GroupRepository(connection);
    const userGroup = new UserGroupRepository(connection);
    repo.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "userId", relatedProperty: "value", type: "dictionary" }, userSettings);
    repo.addEnriched({ destinationProperty: "roles", sourceProperty: "id", relatedKey: "id", type: "list" }, role);
    repo.addEnriched({ destinationProperty: "groups", sourceProperty: "id", relatedKey: "id", type: "list" }, group);
    return repo;
  }
}
