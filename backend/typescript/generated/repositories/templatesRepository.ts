import { Template } from "../types/view/template";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { TemplateTypesRepository } from "./templateTypesRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Template>()
    .add({ type: Template, entity: "Template", entityMapper: new DictionaryMapper([["Template", "templates"]]), propertyMappings: new DictionaryMapper([["templateTypeId", "template_type_id"]]), ids: ["id"], createProperties: ["name", "content"], updateProperties: ["uuid", "name", "content"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "content", "templateTypeId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, content: { type: "string", nullable: false, hasDefault: false }, templateTypeName: { type: "string", nullable: false, hasDefault: false } }) })
    .add("sqlite", { type: Template, entity: "Template", entityMapper: new DictionaryMapper([["Template", "templates"]]), propertyMappings: new DictionaryMapper([["templateTypeId", "template_type_id"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "name", "content"], updateProperties: ["uuid", "created", "version", "name", "content"], readProperties: ["id", "uuid", "created", "updated", "version", "name", "content", "templateTypeId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, content: { type: "string", nullable: false, hasDefault: false }, templateTypeName: { type: "string", nullable: false, hasDefault: false } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Template>()
    .add({ type: Template, entity: "Template", entityMapper: new DictionaryMapper([["Template", "templates"]]), propertyMappings: new DictionaryMapper([["templateTypeId", "template_type_id"]]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "content", "templateTypeId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, content: { type: "string", nullable: false, hasDefault: false }, templateTypeName: { type: "string", nullable: false, hasDefault: false } }) })
    .add("sqlite", { type: Template, entity: "Template", entityMapper: new DictionaryMapper([["Template", "templates"]]), propertyMappings: new DictionaryMapper([["templateTypeId", "template_type_id"]]), readProperties: ["id", "uuid", "created", "updated", "version", "name", "content", "templateTypeId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, name: { type: "string", nullable: false, hasDefault: false }, content: { type: "string", nullable: false, hasDefault: false }, templateTypeName: { type: "string", nullable: false, hasDefault: false } }) })
    .for(connection);

export class TemplatesRepository extends CRUDRepository<Template> {
  readonly templateType: TemplateTypesRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.templateType = new TemplateTypesRepository(connection);
    this.addEnriched({ destinationProperty: "templateTypeName", sourceProperty: "templateTypeId", relatedKey: "id", relatedProperty: "name", type: "object" }, this.templateType);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<Template>(connection, readonlyOptions(connection));
    const templateType = new TemplateTypesRepository(connection);
    repo.addEnriched({ destinationProperty: "templateTypeName", sourceProperty: "templateTypeId", relatedKey: "id", relatedProperty: "name", type: "object" }, templateType);
    return repo;
  }
}
