import { TokenType } from "../types/datasource/tokenType";
import { CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<TokenType>()
    .add({ type: TokenType, entity: "TokenType", entityMapper: new DictionaryMapper([["TokenType", "token_types"]]), propertyMappings: new DictionaryMapper([]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false } }) })
    .add("sqlite", { type: TokenType, entity: "TokenType", entityMapper: new DictionaryMapper([["TokenType", "token_types"]]), propertyMappings: new DictionaryMapper([]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: false } }) })
    .for(connection);

export class TokenTypesRepository extends ReadonlyRepository<TokenType> {
  constructor(connection: IConnection) {
    super(connection, readonlyOptions(connection));
  }
  static createReadonly = (connection: IConnection) => new TokenTypesRepository(connection);
}
