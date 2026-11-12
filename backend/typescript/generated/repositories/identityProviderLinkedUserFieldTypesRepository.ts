import { IdentityProviderLinkedUserFieldType } from "../types/datasource/identityProviderLinkedUserFieldType";
import { CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<IdentityProviderLinkedUserFieldType>()
    .add({ type: IdentityProviderLinkedUserFieldType, entity: "IdentityProviderLinkedUserFieldType", entityMapper: new DictionaryMapper([["IdentityProviderLinkedUserFieldType", "identity_provider_linked_user_field_types"]]), propertyMappings: new DictionaryMapper([]), readProperties: ["id", "uuid", "created", "updated", "version", "name"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false } }) })
    .add("sqlite", { type: IdentityProviderLinkedUserFieldType, entity: "IdentityProviderLinkedUserFieldType", entityMapper: new DictionaryMapper([["IdentityProviderLinkedUserFieldType", "identity_provider_linked_user_field_types"]]), propertyMappings: new DictionaryMapper([]), readProperties: ["id", "uuid", "created", "updated", "version", "name"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false } }) })
    .for(connection);

export class IdentityProviderLinkedUserFieldTypesRepository extends ReadonlyRepository<IdentityProviderLinkedUserFieldType> {
  constructor(connection: IConnection) {
    super(connection, readonlyOptions(connection));
  }
  static createReadonly = (connection: IConnection) => new IdentityProviderLinkedUserFieldTypesRepository(connection);
}
