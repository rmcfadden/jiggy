import type { StringName } from "../types/view/stringName";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<StringName>()
    .add({ entity: "StringName", entityMapper: new DictionaryMapper([["StringName", "string_names"]]), propertyMappings: new DictionaryMapper([]), ids: ["id"], createProperties: ["name", "description"], updateProperties: ["uuid", "name", "description"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "description"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true } }) })
    .add("sqlite", { entity: "StringName", entityMapper: new DictionaryMapper([["StringName", "string_names"]]), propertyMappings: new DictionaryMapper([]), ids: ["id"], createProperties: ["uuid", "created", "version", "name", "description"], updateProperties: ["uuid", "created", "version", "name", "description"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "description"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<StringName>()
    .add({ entity: "StringName", entityMapper: new DictionaryMapper([["StringName", "string_names"]]), propertyMappings: new DictionaryMapper([]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true } }) })
    .add("sqlite", { entity: "StringName", entityMapper: new DictionaryMapper([["StringName", "string_names"]]), propertyMappings: new DictionaryMapper([]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true } }) })
    .for(connection);

export class StringNamesRepository extends CRUDRepository<StringName> {
  constructor(connection: IConnection) {
    super(connection, options(connection));
  }
  static createReadonly = (connection: IConnection) => new ReadonlyRepository<StringName>(connection, readonlyOptions(connection));
}
