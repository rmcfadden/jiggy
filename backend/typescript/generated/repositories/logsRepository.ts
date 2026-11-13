import { Log } from "../types/view/log";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { LogAttributesRepository } from "./logAttributesRepository";
import { LogTypesRepository } from "./logTypesRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Log>()
    .add({ type: Log, entity: "Log", entityMapper: new DictionaryMapper([["Log", "logs"]]), propertyMappings: new DictionaryMapper([["logTypeId", "log_type_id"]]), ids: ["id"], createProperties: ["message"], updateProperties: ["uuid", "message"], readProperties: ["id", "uuid", "created", "updated", "version", "message", "logTypeId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, message: { type: "string", nullable: false, hasDefault: false }, logTypeName: { type: "string", nullable: false, hasDefault: false } }) })
    .add("sqlite", { type: Log, entity: "Log", entityMapper: new DictionaryMapper([["Log", "logs"]]), propertyMappings: new DictionaryMapper([["logTypeId", "log_type_id"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "message"], updateProperties: ["uuid", "created", "version", "message"], readProperties: ["id", "uuid", "created", "updated", "version", "message", "logTypeId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, message: { type: "string", nullable: false, hasDefault: false }, logTypeName: { type: "string", nullable: false, hasDefault: false } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Log>()
    .add({ type: Log, entity: "Log", entityMapper: new DictionaryMapper([["Log", "logs"]]), propertyMappings: new DictionaryMapper([["logTypeId", "log_type_id"]]), readProperties: ["id", "uuid", "created", "updated", "version", "message", "logTypeId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, message: { type: "string", nullable: false, hasDefault: false }, logTypeName: { type: "string", nullable: false, hasDefault: false } }) })
    .add("sqlite", { type: Log, entity: "Log", entityMapper: new DictionaryMapper([["Log", "logs"]]), propertyMappings: new DictionaryMapper([["logTypeId", "log_type_id"]]), readProperties: ["id", "uuid", "created", "updated", "version", "message", "logTypeId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, message: { type: "string", nullable: false, hasDefault: false }, logTypeName: { type: "string", nullable: false, hasDefault: false } }) })
    .for(connection);

export class LogsRepository extends CRUDRepository<Log> {
  readonly logAttribute: LogAttributesRepository;
  readonly logType: LogTypesRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.logAttribute = new LogAttributesRepository(connection);
    this.logType = new LogTypesRepository(connection);
    this.addEnriched({ destinationProperty: "attributes", sourceProperty: "id", relatedKey: "logId", relatedProperty: "value", dictionaryKey: "name", type: "dictionary" }, this.logAttribute);
    this.addEnriched({ destinationProperty: "logTypeName", sourceProperty: "logTypeId", relatedKey: "id", relatedProperty: "name", type: "object" }, this.logType);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<Log>(connection, readonlyOptions(connection));
    const logAttribute = new LogAttributesRepository(connection);
    const logType = new LogTypesRepository(connection);
    repo.addEnriched({ destinationProperty: "attributes", sourceProperty: "id", relatedKey: "logId", relatedProperty: "value", dictionaryKey: "name", type: "dictionary" }, logAttribute);
    repo.addEnriched({ destinationProperty: "logTypeName", sourceProperty: "logTypeId", relatedKey: "id", relatedProperty: "name", type: "object" }, logType);
    return repo;
  }
}
