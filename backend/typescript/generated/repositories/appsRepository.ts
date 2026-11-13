import { App } from "../types/view/app";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { SettingsRepository } from "./settingsRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<App>()
    .add({ type: App, entity: "App", entityMapper: new DictionaryMapper([["App", "apps"]]), propertyMappings: new DictionaryMapper([]), ids: ["id"], createProperties: ["name"], updateProperties: ["uuid", "name"], readProperties: ["id", "uuid", "created", "updated", "version", "name"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false } }) })
    .add("sqlite", { type: App, entity: "App", entityMapper: new DictionaryMapper([["App", "apps"]]), propertyMappings: new DictionaryMapper([]), ids: ["id"], createProperties: ["uuid", "created", "version", "name"], updateProperties: ["uuid", "created", "version", "name"], readProperties: ["id", "uuid", "created", "updated", "version", "name"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<App>()
    .add({ type: App, entity: "App", entityMapper: new DictionaryMapper([["App", "apps"]]), propertyMappings: new DictionaryMapper([]), readProperties: ["id", "uuid", "created", "updated", "version", "name"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false } }) })
    .add("sqlite", { type: App, entity: "App", entityMapper: new DictionaryMapper([["App", "apps"]]), propertyMappings: new DictionaryMapper([]), readProperties: ["id", "uuid", "created", "updated", "version", "name"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false } }) })
    .for(connection);

export class AppsRepository extends CRUDRepository<App> {
  readonly setting: SettingsRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.setting = new SettingsRepository(connection);
    this.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "appId", relatedProperty: "value", dictionaryKey: "name", type: "dictionary" }, this.setting);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<App>(connection, readonlyOptions(connection));
    const setting = new SettingsRepository(connection);
    repo.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "appId", relatedProperty: "value", dictionaryKey: "name", type: "dictionary" }, setting);
    return repo;
  }
}
