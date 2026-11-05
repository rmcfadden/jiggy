import type { Contact } from "../types/view/contact";
import { CRUDRepository, CRUDRepositoryBuilder, DictionaryMapper, ReadonlyRepository, Schema, type IConnection } from "@deterministic-code/datasources";
import { AddressesRepository } from "./addressesRepository";
import { PhonesRepository } from "./phonesRepository";
import { ContactSettingsRepository } from "./contactSettingsRepository";
import { ContactPreferencesRepository } from "./contactPreferencesRepository";
import { ContactSourcesRepository } from "./contactSourcesRepository";
const options = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Contact>()
    .add({ entity: "Contact", entityMapper: new DictionaryMapper([["Contact", "contact_bases"]]), propertyMappings: new DictionaryMapper([["contactSourceId", "contact_source_id"], ["firstName", "first_name"], ["lastName", "last_name"], ["userId", "user_id"]]), ids: ["id"], createProperties: ["contactSourceId", "firstName", "lastName", "email", "notes", "userId"], updateProperties: ["uuid", "contactSourceId", "firstName", "lastName", "email", "notes", "userId"], readProperties: ["id", "uuid", "created", "updated", "version", "contactSourceId", "firstName", "lastName", "email", "notes", "userId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, contactSourceId: { type: "biginteger", nullable: false, hasDefault: false }, firstName: { type: "string", nullable: false, hasDefault: false }, lastName: { type: "string", nullable: false, hasDefault: false }, email: { type: "string", nullable: true, hasDefault: false }, notes: { type: "string", nullable: true, hasDefault: false }, userId: { type: "biginteger", nullable: false, hasDefault: false } }) })
    .add("sqlite", { entity: "Contact", entityMapper: new DictionaryMapper([["Contact", "contact_bases"]]), propertyMappings: new DictionaryMapper([["contactSourceId", "contact_source_id"], ["firstName", "first_name"], ["lastName", "last_name"], ["userId", "user_id"]]), ids: ["id"], createProperties: ["uuid", "created", "version", "contactSourceId", "firstName", "lastName", "email", "notes", "userId"], updateProperties: ["uuid", "created", "version", "contactSourceId", "firstName", "lastName", "email", "notes", "userId"], readProperties: ["id", "uuid", "created", "updated", "version", "contactSourceId", "firstName", "lastName", "email", "notes", "userId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, contactSourceId: { type: "biginteger", nullable: false, hasDefault: false }, firstName: { type: "string", nullable: false, hasDefault: false }, lastName: { type: "string", nullable: false, hasDefault: false }, email: { type: "string", nullable: true, hasDefault: false }, notes: { type: "string", nullable: true, hasDefault: false }, userId: { type: "biginteger", nullable: false, hasDefault: false } }) })
    .for(connection);

const readonlyOptions = (connection: IConnection) =>
  new CRUDRepositoryBuilder<Contact>()
    .add({ entity: "Contact", entityMapper: new DictionaryMapper([["Contact", "contact_bases"]]), propertyMappings: new DictionaryMapper([["contactSourceId", "contact_source_id"], ["firstName", "first_name"], ["lastName", "last_name"], ["userId", "user_id"]]), readProperties: ["id", "uuid", "created", "updated", "version", "contactSourceId", "firstName", "lastName", "email", "notes", "userId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, contactSourceId: { type: "biginteger", nullable: false, hasDefault: false }, firstName: { type: "string", nullable: false, hasDefault: false }, lastName: { type: "string", nullable: false, hasDefault: false }, email: { type: "string", nullable: true, hasDefault: false }, notes: { type: "string", nullable: true, hasDefault: false }, userId: { type: "biginteger", nullable: false, hasDefault: false } }) })
    .add("sqlite", { entity: "Contact", entityMapper: new DictionaryMapper([["Contact", "contact_bases"]]), propertyMappings: new DictionaryMapper([["contactSourceId", "contact_source_id"], ["firstName", "first_name"], ["lastName", "last_name"], ["userId", "user_id"]]), readProperties: ["id", "uuid", "created", "updated", "version", "contactSourceId", "firstName", "lastName", "email", "notes", "userId"], schema: new Schema({ id: { type: "biginteger", nullable: false, hasDefault: false, isId: true }, uuid: { type: "uuid", nullable: false, hasDefault: true }, created: { type: "datetime", nullable: false, hasDefault: true }, updated: { type: "datetime", nullable: false, hasDefault: true }, version: { type: "binary", nullable: false, hasDefault: true }, contactSourceId: { type: "biginteger", nullable: false, hasDefault: false }, firstName: { type: "string", nullable: false, hasDefault: false }, lastName: { type: "string", nullable: false, hasDefault: false }, email: { type: "string", nullable: true, hasDefault: false }, notes: { type: "string", nullable: true, hasDefault: false }, userId: { type: "biginteger", nullable: false, hasDefault: false } }) })
    .for(connection);

export class ContactsRepository extends CRUDRepository<Contact> {
  readonly address: AddressesRepository;
  readonly phone: PhonesRepository;
  readonly contactSetting: ContactSettingsRepository;
  readonly contactPreference: ContactPreferencesRepository;
  readonly contactSource: ContactSourcesRepository;
  constructor(connection: IConnection) {
    super(connection, options(connection));
    this.address = new AddressesRepository(connection);
    this.phone = new PhonesRepository(connection);
    this.contactSetting = new ContactSettingsRepository(connection);
    this.contactPreference = new ContactPreferencesRepository(connection);
    this.contactSource = new ContactSourcesRepository(connection);
    this.addEnriched({ destinationProperty: "addresses", sourceProperty: "id", relatedKey: "contactId", type: "list" }, this.address);
    this.addEnriched({ destinationProperty: "phones", sourceProperty: "id", relatedKey: "contactId", type: "list" }, this.phone);
    this.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "contactId", relatedProperty: "value", type: "dictionary" }, this.contactSetting);
    this.addEnriched({ destinationProperty: "prefs", sourceProperty: "id", relatedKey: "contactId", type: "dictionary" }, this.contactPreference);
    this.addEnriched({ destinationProperty: "contactSourceName", sourceProperty: "contactSourceId", relatedKey: "id", relatedProperty: "name", type: "object" }, this.contactSource);
  }
  static createReadonly(connection: IConnection) {
    const repo = new ReadonlyRepository<Contact>(connection, readonlyOptions(connection));
    const address = new AddressesRepository(connection);
    const phone = new PhonesRepository(connection);
    const contactSetting = new ContactSettingsRepository(connection);
    const contactPreference = new ContactPreferencesRepository(connection);
    const contactSource = new ContactSourcesRepository(connection);
    repo.addEnriched({ destinationProperty: "addresses", sourceProperty: "id", relatedKey: "contactId", type: "list" }, address);
    repo.addEnriched({ destinationProperty: "phones", sourceProperty: "id", relatedKey: "contactId", type: "list" }, phone);
    repo.addEnriched({ destinationProperty: "settings", sourceProperty: "id", relatedKey: "contactId", relatedProperty: "value", type: "dictionary" }, contactSetting);
    repo.addEnriched({ destinationProperty: "prefs", sourceProperty: "id", relatedKey: "contactId", type: "dictionary" }, contactPreference);
    repo.addEnriched({ destinationProperty: "contactSourceName", sourceProperty: "contactSourceId", relatedKey: "id", relatedProperty: "name", type: "object" }, contactSource);
    return repo;
  }
}
