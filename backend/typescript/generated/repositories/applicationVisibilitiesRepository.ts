import { ApplicationVisibility } from "../types/datasource/applicationVisibility";
import { CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<ApplicationVisibility>()
    .add({ type: ApplicationVisibility, entity: "ApplicationVisibility", entityMapper: new DictionaryMapper([["ApplicationVisibility", "application_visibilities"]]), propertyMappings: new DictionaryMapper([]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: true, hasDefault: false } }) })
    .add("sqlite", { type: ApplicationVisibility, entity: "ApplicationVisibility", entityMapper: new DictionaryMapper([["ApplicationVisibility", "application_visibilities"]]), propertyMappings: new DictionaryMapper([]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "description"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: true, hasDefault: false } }) })
    .for(connection);

export class ApplicationVisibilitiesRepository extends ReadonlyRepository<ApplicationVisibility> {
  constructor(connection: IConnection) {
    super(connection, readonlyOptions(connection));
  }
  static createReadonly = (connection: IConnection) => new ApplicationVisibilitiesRepository(connection);
}
