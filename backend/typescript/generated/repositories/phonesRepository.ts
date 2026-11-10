import { Phone } from "../types/view/phone";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { PhoneAttributesRepository } from "./phoneAttributesRepository";
import { LabelsRepository } from "./labelsRepository";
import { PhoneLabelsRepository } from "./phoneLabelsRepository";
import { PhoneTypesRepository } from "./phoneTypesRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Phone>()
    .add({ type: Phone, entity: "Phone", entityMapper: new DictionaryMapper([["Phone", "phones"]]), propertyMappings: new DictionaryMapper([["phoneTypeId", "phone_type_id"], ["contactId", "contact_id"], ["displayName", "display_name"], ["isPrimary", "is_primary"], ["isVerified", "is_verified"]]), ids: ["id"], createProperties: ["phoneTypeId", "contactId", "number", "displayName", "extention", "isPrimary", "isVerified"], updateProperties: ["uuid", "phoneTypeId", "contactId", "number", "displayName", "extention", "isPrimary", "isVerified"], readProperties: ["id", "uuid", "created", "updated", "version", "phoneTypeId", "contactId", "number", "displayName", "extention", "isPrimary", "isVerified"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, phoneTypeId: { type: "biginteger", nullable: false, hasDefault: false }, contactId: { type: "biginteger", nullable: false, hasDefault: false }, number: { type: "string", nullable: false, hasDefault: false }, displayName: { type: "string", nullable: false, hasDefault: false }, extention: { type: "string", nullable: false, hasDefault: false }, isPrimary: { type: "boolean", nullable: false, hasDefault: false }, isVerified: { type: "boolean", nullable: false, hasDefault: true }, phoneTypeName: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: true } }) })
    .add("sqlite", { type: Phone, entity: "Phone", entityMapper: new DictionaryMapper([["Phone", "phones"]]), propertyMappings: new DictionaryMapper([["phoneTypeId", "phone_type_id"], ["contactId", "contact_id"], ["displayName", "display_name"], ["isPrimary", "is_primary"], ["isVerified", "is_verified"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "phoneTypeId", "contactId", "number", "displayName", "extention", "isPrimary", "isVerified"], updateProperties: ["uuid", "created", "version", "phoneTypeId", "contactId", "number", "displayName", "extention", "isPrimary", "isVerified"], readProperties: ["id", "uuid", "created", "updated", "version", "phoneTypeId", "contactId", "number", "displayName", "extention", "isPrimary", "isVerified"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, phoneTypeId: { type: "biginteger", nullable: false, hasDefault: false }, contactId: { type: "biginteger", nullable: false, hasDefault: false }, number: { type: "string", nullable: false, hasDefault: false }, displayName: { type: "string", nullable: false, hasDefault: false }, extention: { type: "string", nullable: false, hasDefault: false }, isPrimary: { type: "boolean", nullable: false, hasDefault: false }, isVerified: { type: "boolean", nullable: false, hasDefault: true }, phoneTypeName: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: true } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Phone>()
    .add({ type: Phone, entity: "Phone", entityMapper: new DictionaryMapper([["Phone", "phones"]]), propertyMappings: new DictionaryMapper([["phoneTypeId", "phone_type_id"], ["contactId", "contact_id"], ["displayName", "display_name"], ["isPrimary", "is_primary"], ["isVerified", "is_verified"]]), readProperties: ["id", "uuid", "created", "updated", "version", "phoneTypeId", "contactId", "number", "displayName", "extention", "isPrimary", "isVerified"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, phoneTypeId: { type: "biginteger", nullable: false, hasDefault: false }, contactId: { type: "biginteger", nullable: false, hasDefault: false }, number: { type: "string", nullable: false, hasDefault: false }, displayName: { type: "string", nullable: false, hasDefault: false }, extention: { type: "string", nullable: false, hasDefault: false }, isPrimary: { type: "boolean", nullable: false, hasDefault: false }, isVerified: { type: "boolean", nullable: false, hasDefault: true }, phoneTypeName: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: true } }) })
    .add("sqlite", { type: Phone, entity: "Phone", entityMapper: new DictionaryMapper([["Phone", "phones"]]), propertyMappings: new DictionaryMapper([["phoneTypeId", "phone_type_id"], ["contactId", "contact_id"], ["displayName", "display_name"], ["isPrimary", "is_primary"], ["isVerified", "is_verified"]]), readProperties: ["id", "uuid", "created", "updated", "version", "phoneTypeId", "contactId", "number", "displayName", "extention", "isPrimary", "isVerified"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, phoneTypeId: { type: "biginteger", nullable: false, hasDefault: false }, contactId: { type: "biginteger", nullable: false, hasDefault: false }, number: { type: "string", nullable: false, hasDefault: false }, displayName: { type: "string", nullable: false, hasDefault: false }, extention: { type: "string", nullable: false, hasDefault: false }, isPrimary: { type: "boolean", nullable: false, hasDefault: false }, isVerified: { type: "boolean", nullable: false, hasDefault: true }, phoneTypeName: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: true } }) })
    .for(connection);

export class PhonesRepository extends CRUDRepository<Phone> {
  readonly phoneAttribute: PhoneAttributesRepository;
  readonly label: LabelsRepository;
  readonly phoneLabel: PhoneLabelsRepository;
  readonly phoneType: PhoneTypesRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.phoneAttribute = new PhoneAttributesRepository(connection);
    this.label = new LabelsRepository(connection);
    this.phoneLabel = new PhoneLabelsRepository(connection);
    this.phoneType = new PhoneTypesRepository(connection);
    this.addEnriched({ destinationProperty: "attributes", sourceProperty: "id", relatedKey: "phoneId", relatedProperty: "value", dictionaryKey: "name", type: "dictionary" }, this.phoneAttribute);
    this.addLinked({ destinationProperty: "labels", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", association: { parent: "phoneId", related: "labelId" }, type: "list" }, this.label, this.phoneLabel);
    this.addEnriched({ destinationProperty: "phoneTypeName", sourceProperty: "phoneTypeId", relatedKey: "id", relatedProperty: "name", type: "object" }, this.phoneType);
    this.addEnriched({ destinationProperty: "description", sourceProperty: "phoneTypeId", relatedKey: "id", relatedProperty: "description", type: "object" }, this.phoneType);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<Phone>(connection, readonlyOptions(connection));
    const phoneAttribute = new PhoneAttributesRepository(connection);
    const label = new LabelsRepository(connection);
    const phoneLabel = new PhoneLabelsRepository(connection);
    const phoneType = new PhoneTypesRepository(connection);
    repo.addEnriched({ destinationProperty: "attributes", sourceProperty: "id", relatedKey: "phoneId", relatedProperty: "value", dictionaryKey: "name", type: "dictionary" }, phoneAttribute);
    repo.addEnriched({ destinationProperty: "labels", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", type: "list" }, label);
    repo.addEnriched({ destinationProperty: "phoneTypeName", sourceProperty: "phoneTypeId", relatedKey: "id", relatedProperty: "name", type: "object" }, phoneType);
    repo.addEnriched({ destinationProperty: "description", sourceProperty: "phoneTypeId", relatedKey: "id", relatedProperty: "description", type: "object" }, phoneType);
    return repo;
  }
}
