import { Template } from "../types/view/template";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { TemplateTypesRepository } from "./templateTypesRepository";
import { LanguagesRepository } from "./languagesRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Template>()
    .add({ type: Template, entity: "Template", entityMapper: new DictionaryMapper([["Template", "templates"]]), propertyMappings: new DictionaryMapper([["templateTypeId", "template_type_id"], ["languageId", "language_id"]]), ids: ["id"], createProperties: ["name", "content"], updateProperties: ["uuid", "name", "content"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "content", "templateTypeId", "languageId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, content: { type: "string", nullable: false, hasDefault: false }, templateTypeName: { type: "string", nullable: false, hasDefault: false }, languageCode: { type: "string", nullable: false, hasDefault: false } }) })
    .add("sqlite", { type: Template, entity: "Template", entityMapper: new DictionaryMapper([["Template", "templates"]]), propertyMappings: new DictionaryMapper([["templateTypeId", "template_type_id"], ["languageId", "language_id"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "name", "content"], updateProperties: ["uuid", "created", "version", "name", "content"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "content", "templateTypeId", "languageId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, content: { type: "string", nullable: false, hasDefault: false }, templateTypeName: { type: "string", nullable: false, hasDefault: false }, languageCode: { type: "string", nullable: false, hasDefault: false } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Template>()
    .add({ type: Template, entity: "Template", entityMapper: new DictionaryMapper([["Template", "templates"]]), propertyMappings: new DictionaryMapper([["templateTypeId", "template_type_id"], ["languageId", "language_id"]]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "content", "templateTypeId", "languageId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, content: { type: "string", nullable: false, hasDefault: false }, templateTypeName: { type: "string", nullable: false, hasDefault: false }, languageCode: { type: "string", nullable: false, hasDefault: false } }) })
    .add("sqlite", { type: Template, entity: "Template", entityMapper: new DictionaryMapper([["Template", "templates"]]), propertyMappings: new DictionaryMapper([["templateTypeId", "template_type_id"], ["languageId", "language_id"]]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "content", "templateTypeId", "languageId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, content: { type: "string", nullable: false, hasDefault: false }, templateTypeName: { type: "string", nullable: false, hasDefault: false }, languageCode: { type: "string", nullable: false, hasDefault: false } }) })
    .for(connection);

export class TemplatesRepository extends CRUDRepository<Template> {
  readonly templateType: TemplateTypesRepository;
  readonly language: LanguagesRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.templateType = new TemplateTypesRepository(connection);
    this.language = new LanguagesRepository(connection);
    this.addEnriched({ destinationProperty: "templateTypeName", sourceProperty: "templateTypeId", relatedKey: "id", relatedProperty: "name", type: "object" }, this.templateType);
    this.addEnriched({ destinationProperty: "languageCode", sourceProperty: "languageId", relatedKey: "id", relatedProperty: "code", type: "object" }, this.language);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<Template>(connection, readonlyOptions(connection));
    const templateType = new TemplateTypesRepository(connection);
    const language = new LanguagesRepository(connection);
    repo.addEnriched({ destinationProperty: "templateTypeName", sourceProperty: "templateTypeId", relatedKey: "id", relatedProperty: "name", type: "object" }, templateType);
    repo.addEnriched({ destinationProperty: "languageCode", sourceProperty: "languageId", relatedKey: "id", relatedProperty: "code", type: "object" }, language);
    return repo;
  }
}
