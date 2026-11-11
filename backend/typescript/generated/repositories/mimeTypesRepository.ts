import { MimeType } from "../types/datasource/mimeType";
import { CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<MimeType>()
    .add({ type: MimeType, entity: "MimeType", entityMapper: new DictionaryMapper([["MimeType", "mime_types"]]), propertyMappings: new DictionaryMapper([]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: true } }) })
    .add("sqlite", { type: MimeType, entity: "MimeType", entityMapper: new DictionaryMapper([["MimeType", "mime_types"]]), propertyMappings: new DictionaryMapper([]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: true } }) })
    .for(connection);

export class MimeTypesRepository extends ReadonlyRepository<MimeType> {
  constructor(connection: IConnection) {
    super(connection, readonlyOptions(connection));
  }
  static createReadonly = (connection: IConnection) => new MimeTypesRepository(connection);
}
