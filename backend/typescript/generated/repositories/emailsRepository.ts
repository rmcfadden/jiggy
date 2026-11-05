import type { Email } from "../types/view/email";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { EmailAttributesRepository } from "./emailAttributesRepository";
import { LabelsRepository } from "./labelsRepository";
import { EmailLabelsRepository } from "./emailLabelsRepository";
import { EmailTypesRepository } from "./emailTypesRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Email>()
    .add({ entity: "Email", entityMapper: new DictionaryMapper([["Email", "emails"]]), propertyMappings: new DictionaryMapper([["emailTypeId", "email_type_id"], ["contactId", "contact_id"], ["displayName", "display_name"], ["isPrimary", "is_primary"]]), ids: ["id"], createProperties: ["emailTypeId", "contactId", "address", "displayName", "isPrimary"], updateProperties: ["uuid", "emailTypeId", "contactId", "address", "displayName", "isPrimary"], readProperties: ["id", "uuid", "created", "updated", "version", "emailTypeId", "contactId", "address", "displayName", "isPrimary"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, emailTypeId: { type: "biginteger", nullable: false, hasDefault: false }, contactId: { type: "biginteger", nullable: false, hasDefault: false }, address: { type: "string", nullable: false, hasDefault: false }, displayName: { type: "string", nullable: false, hasDefault: true }, isPrimary: { type: "boolean", nullable: false, hasDefault: false } }) })
    .add("sqlite", { entity: "Email", entityMapper: new DictionaryMapper([["Email", "email_bases"]]), propertyMappings: new DictionaryMapper([["emailTypeId", "email_type_id"], ["contactId", "contact_id"], ["displayName", "display_name"], ["isPrimary", "is_primary"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "emailTypeId", "contactId", "address", "displayName", "isPrimary"], updateProperties: ["uuid", "created", "version", "emailTypeId", "contactId", "address", "displayName", "isPrimary"], readProperties: ["id", "uuid", "created", "updated", "version", "emailTypeId", "contactId", "address", "displayName", "isPrimary"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, emailTypeId: { type: "biginteger", nullable: false, hasDefault: false }, contactId: { type: "biginteger", nullable: false, hasDefault: false }, address: { type: "string", nullable: false, hasDefault: false }, displayName: { type: "string", nullable: false, hasDefault: true }, isPrimary: { type: "boolean", nullable: false, hasDefault: false } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Email>()
    .add({ entity: "Email", entityMapper: new DictionaryMapper([["Email", "emails"]]), propertyMappings: new DictionaryMapper([["emailTypeId", "email_type_id"], ["contactId", "contact_id"], ["displayName", "display_name"], ["isPrimary", "is_primary"]]), readProperties: ["id", "uuid", "created", "updated", "version", "emailTypeId", "contactId", "address", "displayName", "isPrimary"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, emailTypeId: { type: "biginteger", nullable: false, hasDefault: false }, contactId: { type: "biginteger", nullable: false, hasDefault: false }, address: { type: "string", nullable: false, hasDefault: false }, displayName: { type: "string", nullable: false, hasDefault: true }, isPrimary: { type: "boolean", nullable: false, hasDefault: false } }) })
    .add("sqlite", { entity: "Email", entityMapper: new DictionaryMapper([["Email", "email_bases"]]), propertyMappings: new DictionaryMapper([["emailTypeId", "email_type_id"], ["contactId", "contact_id"], ["displayName", "display_name"], ["isPrimary", "is_primary"]]), readProperties: ["id", "uuid", "created", "updated", "version", "emailTypeId", "contactId", "address", "displayName", "isPrimary"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, emailTypeId: { type: "biginteger", nullable: false, hasDefault: false }, contactId: { type: "biginteger", nullable: false, hasDefault: false }, address: { type: "string", nullable: false, hasDefault: false }, displayName: { type: "string", nullable: false, hasDefault: true }, isPrimary: { type: "boolean", nullable: false, hasDefault: false } }) })
    .for(connection);

export class EmailsRepository extends CRUDRepository<Email> {
  readonly emailAttribute: EmailAttributesRepository;
  readonly label: LabelsRepository;
  readonly emailLabel: EmailLabelsRepository;
  readonly emailType: EmailTypesRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.emailAttribute = new EmailAttributesRepository(connection);
    this.label = new LabelsRepository(connection);
    this.emailLabel = new EmailLabelsRepository(connection);
    this.emailType = new EmailTypesRepository(connection);
    this.addEnriched({ destinationProperty: "attributes", sourceProperty: "id", relatedKey: "emailId", relatedProperty: "value", type: "dictionary" }, this.emailAttribute);
    this.addLinked({ destinationProperty: "labels", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", association: { parent: "emailId", related: "labelId" }, type: "list" }, this.label, this.emailLabel);
    this.addEnriched({ destinationProperty: "emailTypeName", sourceProperty: "emailTypeId", relatedKey: "id", relatedProperty: "name", type: "object" }, this.emailType);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<Email>(connection, readonlyOptions(connection));
    const emailAttribute = new EmailAttributesRepository(connection);
    const label = new LabelsRepository(connection);
    const emailLabel = new EmailLabelsRepository(connection);
    const emailType = new EmailTypesRepository(connection);
    repo.addEnriched({ destinationProperty: "attributes", sourceProperty: "id", relatedKey: "emailId", relatedProperty: "value", type: "dictionary" }, emailAttribute);
    repo.addEnriched({ destinationProperty: "labels", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", type: "list" }, label);
    repo.addEnriched({ destinationProperty: "emailTypeName", sourceProperty: "emailTypeId", relatedKey: "id", relatedProperty: "name", type: "object" }, emailType);
    return repo;
  }
}
