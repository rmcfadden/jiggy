import { Label } from "../types/datasource/label";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Label>()
    .add({ type: Label, entity: "Label", entityMapper: new DictionaryMapper([["Label", "labels"]]), propertyMappings: new DictionaryMapper([]), ids: ["id"], createProperties: ["name", "description"], updateProperties: ["uuid", "name", "description"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "description"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: true } }) })
    .add("sqlite", { type: Label, entity: "Label", entityMapper: new DictionaryMapper([["Label", "labels"]]), propertyMappings: new DictionaryMapper([]), ids: ["id"], createProperties: ["uuid", "created", "version", "name", "description"], updateProperties: ["uuid", "created", "version", "name", "description"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "description"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: true } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Label>()
    .add({ type: Label, entity: "Label", entityMapper: new DictionaryMapper([["Label", "labels"]]), propertyMappings: new DictionaryMapper([]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: true } }) })
    .add("sqlite", { type: Label, entity: "Label", entityMapper: new DictionaryMapper([["Label", "labels"]]), propertyMappings: new DictionaryMapper([]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: true } }) })
    .for(connection);

export class LabelsRepository extends CRUDRepository<Label> {
  constructor(connection: IConnection) {
    super(connection, options(connection));
  }
  static createReadonly = (connection: IConnection) => new ReadonlyRepository<Label>(connection, readonlyOptions(connection));
}
