import type { User } from "../types/view/user";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { UserSettingsRepository } from "./userSettingsRepository";
import { RolesRepository } from "./rolesRepository";
import { UserRolesRepository } from "./userRolesRepository";
import { GroupsRepository } from "./groupsRepository";
import { UserGroupsRepository } from "./userGroupsRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<User>()
    .add({ entity: "User", entityMapper: new DictionaryMapper([["User", "users"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"]]), ids: ["id"], createProperties: ["username", "isEnabled"], updateProperties: ["uuid", "username", "isEnabled"], readProperties: ["id", "uuid", "created", "updated", "version", "username", "isEnabled"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, username: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true } }) })
    .add("sqlite", { entity: "User", entityMapper: new DictionaryMapper([["User", "users"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "username", "isEnabled"], updateProperties: ["uuid", "created", "version", "username", "isEnabled"], readProperties: ["id", "uuid", "created", "updated", "version", "username", "isEnabled"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, username: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<User>()
    .add({ entity: "User", entityMapper: new DictionaryMapper([["User", "users"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"]]), readProperties: ["id", "uuid", "created", "updated", "version", "username", "isEnabled"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, username: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true } }) })
    .add("sqlite", { entity: "User", entityMapper: new DictionaryMapper([["User", "users"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"]]), readProperties: ["id", "uuid", "created", "updated", "version", "username", "isEnabled"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, username: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true } }) })
    .for(connection);

export class UsersRepository extends CRUDRepository<User> {
  readonly userSetting: UserSettingsRepository;
  readonly role: RolesRepository;
  readonly userRole: UserRolesRepository;
  readonly group: GroupsRepository;
  readonly userGroup: UserGroupsRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.userSetting = new UserSettingsRepository(connection);
    this.role = new RolesRepository(connection);
    this.userRole = new UserRolesRepository(connection);
    this.group = new GroupsRepository(connection);
    this.userGroup = new UserGroupsRepository(connection);
    this.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "userId", relatedProperty: "value", type: "dictionary" }, this.userSetting);
    this.addLinked({ destinationProperty: "roles", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", association: { parent: "userId", related: "roleId" }, type: "list" }, this.role, this.userRole);
    this.addLinked({ destinationProperty: "groups", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", association: { parent: "userId", related: "groupId" }, type: "list" }, this.group, this.userGroup);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<User>(connection, readonlyOptions(connection));
    const userSetting = new UserSettingsRepository(connection);
    const role = new RolesRepository(connection);
    const userRole = new UserRolesRepository(connection);
    const group = new GroupsRepository(connection);
    const userGroup = new UserGroupsRepository(connection);
    repo.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "userId", relatedProperty: "value", type: "dictionary" }, userSetting);
    repo.addEnriched({ destinationProperty: "roles", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", type: "list" }, role);
    repo.addEnriched({ destinationProperty: "groups", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", type: "list" }, group);
    return repo;
  }
}
