import { OauthGrantType } from "../types/datasource/oauthGrantType";
import { CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<OauthGrantType>()
    .add({ type: OauthGrantType, entity: "OauthGrantType", entityMapper: new DictionaryMapper([["OauthGrantType", "oauth_grant_types"]]), propertyMappings: new DictionaryMapper([["isCustom", "is_custom"], ["isEnabled", "is_enabled"], ["isLegacy", "is_legacy"]]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "isCustom", "isEnabled", "isLegacy"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, isCustom: { type: "boolean", nullable: false, hasDefault: true }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isLegacy: { type: "boolean", nullable: false, hasDefault: true } }) })
    .add("sqlite", { type: OauthGrantType, entity: "OauthGrantType", entityMapper: new DictionaryMapper([["OauthGrantType", "oauth_grant_types"]]), propertyMappings: new DictionaryMapper([["isCustom", "is_custom"], ["isEnabled", "is_enabled"], ["isLegacy", "is_legacy"]]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description", "isCustom", "isEnabled", "isLegacy"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false }, isCustom: { type: "boolean", nullable: false, hasDefault: true }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isLegacy: { type: "boolean", nullable: false, hasDefault: true } }) })
    .for(connection);

export class OauthGrantTypesRepository extends ReadonlyRepository<OauthGrantType> {
  constructor(connection: IConnection) {
    super(connection, readonlyOptions(connection));
  }
  static createReadonly = (connection: IConnection) => new OauthGrantTypesRepository(connection);
}
