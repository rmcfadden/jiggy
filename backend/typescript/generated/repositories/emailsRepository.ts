import { Email } from "../types/view/email";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { EmailAttributesRepository } from "./emailAttributesRepository";
import { LabelsRepository } from "./labelsRepository";
import { EmailLabelsRepository } from "./emailLabelsRepository";
import { EmailTypesRepository } from "./emailTypesRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Email>()
    .add({ type: Email, entity: "Email", entityMapper: new DictionaryMapper([["Email", "emails"]]), propertyMappings: new DictionaryMapper([["emailTypeId", "email_type_id"], ["contactId", "contact_id"], ["displayName", "display_name"], ["isPrimary", "is_primary"], ["isVerified", "is_verified"]]), ids: ["id"], createProperties: ["emailTypeId", "contactId", "address", "displayName", "isPrimary", "isVerified"], updateProperties: ["uuid", "emailTypeId", "contactId", "address", "displayName", "isPrimary", "isVerified"], readProperties: ["id", "uuid", "created", "updated", "version", "emailTypeId", "contactId", "address", "displayName", "isPrimary", "isVerified"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, emailTypeId: { type: "biginteger", nullable: false, hasDefault: false }, contactId: { type: "biginteger", nullable: false, hasDefault: false }, address: { type: "string", nullable: false, hasDefault: false }, displayName: { type: "string", nullable: false, hasDefault: true }, isPrimary: { type: "boolean", nullable: false, hasDefault: false }, isVerified: { type: "boolean", nullable: false, hasDefault: true }, emailTypeName: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: true } }) })
    .add("sqlite", { type: Email, entity: "Email", entityMapper: new DictionaryMapper([["Email", "emails"]]), propertyMappings: new DictionaryMapper([["emailTypeId", "email_type_id"], ["contactId", "contact_id"], ["displayName", "display_name"], ["isPrimary", "is_primary"], ["isVerified", "is_verified"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "emailTypeId", "contactId", "address", "displayName", "isPrimary", "isVerified"], updateProperties: ["uuid", "created", "version", "emailTypeId", "contactId", "address", "displayName", "isPrimary", "isVerified"], readProperties: ["id", "uuid", "created", "updated", "version", "emailTypeId", "contactId", "address", "displayName", "isPrimary", "isVerified"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, emailTypeId: { type: "biginteger", nullable: false, hasDefault: false }, contactId: { type: "biginteger", nullable: false, hasDefault: false }, address: { type: "string", nullable: false, hasDefault: false }, displayName: { type: "string", nullable: false, hasDefault: true }, isPrimary: { type: "boolean", nullable: false, hasDefault: false }, isVerified: { type: "boolean", nullable: false, hasDefault: true }, emailTypeName: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: true } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Email>()
    .add({ type: Email, entity: "Email", entityMapper: new DictionaryMapper([["Email", "emails"]]), propertyMappings: new DictionaryMapper([["emailTypeId", "email_type_id"], ["contactId", "contact_id"], ["displayName", "display_name"], ["isPrimary", "is_primary"], ["isVerified", "is_verified"]]), readProperties: ["id", "uuid", "created", "updated", "version", "emailTypeId", "contactId", "address", "displayName", "isPrimary", "isVerified"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, emailTypeId: { type: "biginteger", nullable: false, hasDefault: false }, contactId: { type: "biginteger", nullable: false, hasDefault: false }, address: { type: "string", nullable: false, hasDefault: false }, displayName: { type: "string", nullable: false, hasDefault: true }, isPrimary: { type: "boolean", nullable: false, hasDefault: false }, isVerified: { type: "boolean", nullable: false, hasDefault: true }, emailTypeName: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: true } }) })
    .add("sqlite", { type: Email, entity: "Email", entityMapper: new DictionaryMapper([["Email", "emails"]]), propertyMappings: new DictionaryMapper([["emailTypeId", "email_type_id"], ["contactId", "contact_id"], ["displayName", "display_name"], ["isPrimary", "is_primary"], ["isVerified", "is_verified"]]), readProperties: ["id", "uuid", "created", "updated", "version", "emailTypeId", "contactId", "address", "displayName", "isPrimary", "isVerified"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, emailTypeId: { type: "biginteger", nullable: false, hasDefault: false }, contactId: { type: "biginteger", nullable: false, hasDefault: false }, address: { type: "string", nullable: false, hasDefault: false }, displayName: { type: "string", nullable: false, hasDefault: true }, isPrimary: { type: "boolean", nullable: false, hasDefault: false }, isVerified: { type: "boolean", nullable: false, hasDefault: true }, emailTypeName: { type: "string", nullable: false, hasDefault: false }, description: { type: "string", nullable: false, hasDefault: true } }) })
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
    this.addEnriched({ destinationProperty: "attributes", sourceProperty: "id", relatedKey: "emailId", relatedProperty: "value", dictionaryKey: "name", type: "dictionary" }, this.emailAttribute);
    this.addLinked({ destinationProperty: "labels", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", association: { parent: "emailId", related: "labelId" }, type: "list" }, this.label, this.emailLabel);
    this.addEnriched({ destinationProperty: "emailTypeName", sourceProperty: "emailTypeId", relatedKey: "id", relatedProperty: "name", type: "object" }, this.emailType);
    this.addEnriched({ destinationProperty: "description", sourceProperty: "emailTypeId", relatedKey: "id", relatedProperty: "description", type: "object" }, this.emailType);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<Email>(connection, readonlyOptions(connection));
    const emailAttribute = new EmailAttributesRepository(connection);
    const label = new LabelsRepository(connection);
    const emailLabel = new EmailLabelsRepository(connection);
    const emailType = new EmailTypesRepository(connection);
    repo.addEnriched({ destinationProperty: "attributes", sourceProperty: "id", relatedKey: "emailId", relatedProperty: "value", dictionaryKey: "name", type: "dictionary" }, emailAttribute);
    repo.addEnriched({ destinationProperty: "labels", sourceProperty: "id", relatedKey: "id", relatedProperty: "name", type: "list" }, label);
    repo.addEnriched({ destinationProperty: "emailTypeName", sourceProperty: "emailTypeId", relatedKey: "id", relatedProperty: "name", type: "object" }, emailType);
    repo.addEnriched({ destinationProperty: "description", sourceProperty: "emailTypeId", relatedKey: "id", relatedProperty: "description", type: "object" }, emailType);
    return repo;
  }
}
