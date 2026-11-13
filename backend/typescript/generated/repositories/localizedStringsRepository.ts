import { LocalizedString } from "../types/view/localizedString";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { LocalizedStringNamesRepository } from "./localizedStringNamesRepository";
import { LanguagesRepository } from "./languagesRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<LocalizedString>()
    .add({ type: LocalizedString, entity: "LocalizedString", entityMapper: new DictionaryMapper([["LocalizedString", "localized_strings"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"], ["localizedStringNameId", "localized_string_name_id"], ["languageId", "language_id"]]), ids: ["id"], createProperties: ["value", "isEnabled", "isDeleted"], updateProperties: ["uuid", "value", "isEnabled", "isDeleted"], readProperties: ["id", "uuid", "created", "updated", "version", "value", "isEnabled", "isDeleted", "localizedStringNameId", "languageId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, value: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, languageName: { type: "string", nullable: false, hasDefault: false } }) })
    .add("sqlite", { type: LocalizedString, entity: "LocalizedString", entityMapper: new DictionaryMapper([["LocalizedString", "localized_strings"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"], ["localizedStringNameId", "localized_string_name_id"], ["languageId", "language_id"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "value", "isEnabled", "isDeleted"], updateProperties: ["uuid", "created", "version", "value", "isEnabled", "isDeleted"], readProperties: ["id", "uuid", "created", "updated", "version", "value", "isEnabled", "isDeleted", "localizedStringNameId", "languageId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, value: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, languageName: { type: "string", nullable: false, hasDefault: false } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<LocalizedString>()
    .add({ type: LocalizedString, entity: "LocalizedString", entityMapper: new DictionaryMapper([["LocalizedString", "localized_strings"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"], ["localizedStringNameId", "localized_string_name_id"], ["languageId", "language_id"]]), readProperties: ["id", "uuid", "created", "updated", "version", "value", "isEnabled", "isDeleted", "localizedStringNameId", "languageId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, value: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, languageName: { type: "string", nullable: false, hasDefault: false } }) })
    .add("sqlite", { type: LocalizedString, entity: "LocalizedString", entityMapper: new DictionaryMapper([["LocalizedString", "localized_strings"]]), propertyMappings: new DictionaryMapper([["isEnabled", "is_enabled"], ["isDeleted", "is_deleted"], ["localizedStringNameId", "localized_string_name_id"], ["languageId", "language_id"]]), readProperties: ["id", "uuid", "created", "updated", "version", "value", "isEnabled", "isDeleted", "localizedStringNameId", "languageId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, value: { type: "string", nullable: false, hasDefault: false }, isEnabled: { type: "boolean", nullable: false, hasDefault: true }, isDeleted: { type: "boolean", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, languageName: { type: "string", nullable: false, hasDefault: false } }) })
    .for(connection);

export class LocalizedStringsRepository extends CRUDRepository<LocalizedString> {
  readonly localizedStringName: LocalizedStringNamesRepository;
  readonly language: LanguagesRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.localizedStringName = new LocalizedStringNamesRepository(connection);
    this.language = new LanguagesRepository(connection);
    this.addEnriched({ destinationProperty: "name", sourceProperty: "localizedStringNameId", relatedKey: "id", relatedProperty: "name", type: "object" }, this.localizedStringName);
    this.addEnriched({ destinationProperty: "languageName", sourceProperty: "languageId", relatedKey: "id", relatedProperty: "name", type: "object" }, this.language);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<LocalizedString>(connection, readonlyOptions(connection));
    const localizedStringName = new LocalizedStringNamesRepository(connection);
    const language = new LanguagesRepository(connection);
    repo.addEnriched({ destinationProperty: "name", sourceProperty: "localizedStringNameId", relatedKey: "id", relatedProperty: "name", type: "object" }, localizedStringName);
    repo.addEnriched({ destinationProperty: "languageName", sourceProperty: "languageId", relatedKey: "id", relatedProperty: "name", type: "object" }, language);
    return repo;
  }
}
