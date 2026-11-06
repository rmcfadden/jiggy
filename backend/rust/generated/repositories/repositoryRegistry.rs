use datasources::{CRUDRepository, Datasource, ICRUDRepository, IReadonlyRepository, RepositoryFactory};
use super::super::Address;
use super::super::AddressAttribute;
use super::super::AddressLabel;
use super::super::AddressType;
use super::super::Category;
use super::super::Contact;
use super::super::ContactAttribute;
use super::super::ContactLabel;
use super::super::Email;
use super::super::EmailAttribute;
use super::super::EmailLabel;
use super::super::EmailType;
use super::super::Game;
use super::super::GameCategory;
use super::super::GameParent;
use super::super::GameParentCategory;
use super::super::GameParentConfig;
use super::super::GameParentSetting;
use super::super::GameSetting;
use super::super::GameState;
use super::super::Gender;
use super::super::Group;
use super::super::Label;
use super::super::Language;
use super::super::LocalizedString;
use super::super::LocalizedStringName;
use super::super::MimeType;
use super::super::Phone;
use super::super::PhoneAttribute;
use super::super::PhoneLabel;
use super::super::PhoneType;
use super::super::Resource;
use super::super::Review;
use super::super::Role;
use super::super::User;
use super::super::UserGroup;
use super::super::UserRole;
use super::super::UserSetting;
use std::sync::Arc;

pub fn register(factory: &RepositoryFactory) {
    factory.register_named(
        "Address",
        "addresses",
        |connection| Arc::new(super::addressesRepository::addresses_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Address>>,
        |connection| Arc::new(super::addressesRepository::addresses_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Address>>,
    );
    factory.register_named(
        "AddressAttribute",
        "address_attributes",
        |connection| Arc::new(super::addressAttributesRepository::address_attributes_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<AddressAttribute>>,
        |connection| Arc::new(super::addressAttributesRepository::address_attributes_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<AddressAttribute>>,
    );
    factory.register_named(
        "AddressLabel",
        "address_labels",
        |connection| Arc::new(super::addressLabelsRepository::address_labels_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<AddressLabel>>,
        |connection| Arc::new(super::addressLabelsRepository::address_labels_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<AddressLabel>>,
    );
    factory.register_named(
        "AddressType",
        "address_types",
        |connection| Arc::new(super::addressTypesRepository::address_types_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<AddressType>>,
        |connection| Arc::new(super::addressTypesRepository::address_types_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<AddressType>>,
    );
    factory.register_named(
        "Category",
        "categories",
        |connection| Arc::new(super::categoriesRepository::categories_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Category>>,
        |connection| Arc::new(super::categoriesRepository::categories_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Category>>,
    );
    factory.register_named(
        "Contact",
        "contacts",
        |connection| Arc::new(super::contactsRepository::contacts_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Contact>>,
        |connection| Arc::new(super::contactsRepository::contacts_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Contact>>,
    );
    factory.register_named(
        "ContactAttribute",
        "contact_attributes",
        |connection| Arc::new(super::contactAttributesRepository::contact_attributes_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactAttribute>>,
        |connection| Arc::new(super::contactAttributesRepository::contact_attributes_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactAttribute>>,
    );
    factory.register_named(
        "ContactLabel",
        "contact_labels",
        |connection| Arc::new(super::contactLabelsRepository::contact_labels_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<ContactLabel>>,
        |connection| Arc::new(super::contactLabelsRepository::contact_labels_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<ContactLabel>>,
    );
    factory.register_named(
        "Email",
        "emails",
        |connection| Arc::new(super::emailsRepository::emails_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Email>>,
        |connection| Arc::new(super::emailsRepository::emails_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Email>>,
    );
    factory.register_named(
        "EmailAttribute",
        "email_attributes",
        |connection| Arc::new(super::emailAttributesRepository::email_attributes_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<EmailAttribute>>,
        |connection| Arc::new(super::emailAttributesRepository::email_attributes_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<EmailAttribute>>,
    );
    factory.register_named(
        "EmailLabel",
        "email_labels",
        |connection| Arc::new(super::emailLabelsRepository::email_labels_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<EmailLabel>>,
        |connection| Arc::new(super::emailLabelsRepository::email_labels_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<EmailLabel>>,
    );
    factory.register_named(
        "EmailType",
        "email_types",
        |connection| Arc::new(super::emailTypesRepository::email_types_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<EmailType>>,
        |connection| Arc::new(super::emailTypesRepository::email_types_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<EmailType>>,
    );
    factory.register_named(
        "Game",
        "games",
        |connection| Arc::new(super::gamesRepository::games_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Game>>,
        |connection| Arc::new(super::gamesRepository::games_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Game>>,
    );
    factory.register_named(
        "GameCategory",
        "game_categories",
        |connection| Arc::new(super::gameCategoriesRepository::game_categories_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameCategory>>,
        |connection| Arc::new(super::gameCategoriesRepository::game_categories_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameCategory>>,
    );
    factory.register_named(
        "GameParent",
        "game_parents",
        |connection| Arc::new(super::gameParentsRepository::game_parents_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameParent>>,
        |connection| Arc::new(super::gameParentsRepository::game_parents_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameParent>>,
    );
    factory.register_named(
        "GameParentCategory",
        "game_parent_categories",
        |connection| Arc::new(super::gameParentCategoriesRepository::game_parent_categories_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameParentCategory>>,
        |connection| Arc::new(super::gameParentCategoriesRepository::game_parent_categories_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameParentCategory>>,
    );
    factory.register_named(
        "GameParentConfig",
        "game_parent_configs",
        |connection| Arc::new(super::gameParentConfigsRepository::game_parent_configs_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameParentConfig>>,
        |connection| Arc::new(super::gameParentConfigsRepository::game_parent_configs_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameParentConfig>>,
    );
    factory.register_named(
        "GameParentSetting",
        "game_parent_settings",
        |connection| Arc::new(super::gameParentSettingsRepository::game_parent_settings_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameParentSetting>>,
        |connection| Arc::new(super::gameParentSettingsRepository::game_parent_settings_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameParentSetting>>,
    );
    factory.register_named(
        "GameSetting",
        "game_settings",
        |connection| Arc::new(super::gameSettingsRepository::game_settings_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameSetting>>,
        |connection| Arc::new(super::gameSettingsRepository::game_settings_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameSetting>>,
    );
    factory.register_named(
        "GameState",
        "game_states",
        |connection| Arc::new(super::gameStatesRepository::game_states_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<GameState>>,
        |connection| Arc::new(super::gameStatesRepository::game_states_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<GameState>>,
    );
    factory.register_named(
        "Gender",
        "genders",
        |connection| Arc::new(super::gendersRepository::genders_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Gender>>,
        |connection| Arc::new(super::gendersRepository::genders_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Gender>>,
    );
    factory.register_named(
        "Group",
        "groups",
        |connection| Arc::new(super::groupsRepository::groups_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Group>>,
        |connection| Arc::new(super::groupsRepository::groups_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Group>>,
    );
    factory.register_named(
        "Label",
        "labels",
        |connection| Arc::new(super::labelsRepository::labels_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Label>>,
        |connection| Arc::new(super::labelsRepository::labels_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Label>>,
    );
    factory.register_named(
        "Language",
        "languages",
        |connection| Arc::new(super::languagesRepository::languages_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Language>>,
        |connection| Arc::new(super::languagesRepository::languages_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Language>>,
    );
    factory.register_named(
        "LocalizedString",
        "localized_strings",
        |connection| Arc::new(super::localizedStringsRepository::localized_strings_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<LocalizedString>>,
        |connection| Arc::new(super::localizedStringsRepository::localized_strings_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<LocalizedString>>,
    );
    factory.register_named(
        "LocalizedStringName",
        "localized_string_names",
        |connection| Arc::new(super::localizedStringNamesRepository::localized_string_names_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<LocalizedStringName>>,
        |connection| Arc::new(super::localizedStringNamesRepository::localized_string_names_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<LocalizedStringName>>,
    );
    factory.register_named(
        "MimeType",
        "mime_types",
        |connection| Arc::new(super::mimeTypesRepository::mime_types_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<MimeType>>,
        |connection| Arc::new(super::mimeTypesRepository::mime_types_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<MimeType>>,
    );
    factory.register_named(
        "Phone",
        "phones",
        |connection| Arc::new(super::phonesRepository::phones_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Phone>>,
        |connection| Arc::new(super::phonesRepository::phones_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Phone>>,
    );
    factory.register_named(
        "PhoneAttribute",
        "phone_attributes",
        |connection| Arc::new(super::phoneAttributesRepository::phone_attributes_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<PhoneAttribute>>,
        |connection| Arc::new(super::phoneAttributesRepository::phone_attributes_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<PhoneAttribute>>,
    );
    factory.register_named(
        "PhoneLabel",
        "phone_labels",
        |connection| Arc::new(super::phoneLabelsRepository::phone_labels_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<PhoneLabel>>,
        |connection| Arc::new(super::phoneLabelsRepository::phone_labels_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<PhoneLabel>>,
    );
    factory.register_named(
        "PhoneType",
        "phone_types",
        |connection| Arc::new(super::phoneTypesRepository::phone_types_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<PhoneType>>,
        |connection| Arc::new(super::phoneTypesRepository::phone_types_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<PhoneType>>,
    );
    factory.register_named(
        "Resource",
        "resources",
        |connection| Arc::new(super::resourcesRepository::resources_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Resource>>,
        |connection| Arc::new(super::resourcesRepository::resources_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Resource>>,
    );
    factory.register_named(
        "Review",
        "reviews",
        |connection| Arc::new(super::reviewsRepository::reviews_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Review>>,
        |connection| Arc::new(super::reviewsRepository::reviews_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Review>>,
    );
    factory.register_named(
        "Role",
        "roles",
        |connection| Arc::new(super::rolesRepository::roles_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<Role>>,
        |connection| Arc::new(super::rolesRepository::roles_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<Role>>,
    );
    factory.register_named(
        "User",
        "users",
        |connection| Arc::new(super::usersRepository::users_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<User>>,
        |connection| Arc::new(super::usersRepository::users_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<User>>,
    );
    factory.register_named(
        "UserGroup",
        "user_groups",
        |connection| Arc::new(super::userGroupsRepository::user_groups_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserGroup>>,
        |connection| Arc::new(super::userGroupsRepository::user_groups_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserGroup>>,
    );
    factory.register_named(
        "UserRole",
        "user_roles",
        |connection| Arc::new(super::userRolesRepository::user_roles_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserRole>>,
        |connection| Arc::new(super::userRolesRepository::user_roles_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserRole>>,
    );
    factory.register_named(
        "UserSetting",
        "user_settings",
        |connection| Arc::new(super::userSettingsRepository::user_settings_repository(connection).expect("repository")) as Arc<dyn ICRUDRepository<UserSetting>>,
        |connection| Arc::new(super::userSettingsRepository::user_settings_readonly_repository(connection).expect("repository")) as Arc<dyn IReadonlyRepository<UserSetting>>,
    );
}

datasources::bind_repositories!(register);

pub trait Repositories {
    fn addresses(&self) -> Arc<CRUDRepository<Address>>;
    fn address_attributes(&self) -> Arc<CRUDRepository<AddressAttribute>>;
    fn address_labels(&self) -> Arc<CRUDRepository<AddressLabel>>;
    fn address_types(&self) -> Arc<CRUDRepository<AddressType>>;
    fn categories(&self) -> Arc<CRUDRepository<Category>>;
    fn contacts(&self) -> Arc<CRUDRepository<Contact>>;
    fn contact_attributes(&self) -> Arc<CRUDRepository<ContactAttribute>>;
    fn contact_labels(&self) -> Arc<CRUDRepository<ContactLabel>>;
    fn emails(&self) -> Arc<CRUDRepository<Email>>;
    fn email_attributes(&self) -> Arc<CRUDRepository<EmailAttribute>>;
    fn email_labels(&self) -> Arc<CRUDRepository<EmailLabel>>;
    fn email_types(&self) -> Arc<CRUDRepository<EmailType>>;
    fn games(&self) -> Arc<CRUDRepository<Game>>;
    fn game_categories(&self) -> Arc<CRUDRepository<GameCategory>>;
    fn game_parents(&self) -> Arc<CRUDRepository<GameParent>>;
    fn game_parent_categories(&self) -> Arc<CRUDRepository<GameParentCategory>>;
    fn game_parent_configs(&self) -> Arc<CRUDRepository<GameParentConfig>>;
    fn game_parent_settings(&self) -> Arc<CRUDRepository<GameParentSetting>>;
    fn game_settings(&self) -> Arc<CRUDRepository<GameSetting>>;
    fn game_states(&self) -> Arc<CRUDRepository<GameState>>;
    fn genders(&self) -> Arc<CRUDRepository<Gender>>;
    fn groups(&self) -> Arc<CRUDRepository<Group>>;
    fn labels(&self) -> Arc<CRUDRepository<Label>>;
    fn languages(&self) -> Arc<CRUDRepository<Language>>;
    fn localized_strings(&self) -> Arc<CRUDRepository<LocalizedString>>;
    fn localized_string_names(&self) -> Arc<CRUDRepository<LocalizedStringName>>;
    fn mime_types(&self) -> Arc<CRUDRepository<MimeType>>;
    fn phones(&self) -> Arc<CRUDRepository<Phone>>;
    fn phone_attributes(&self) -> Arc<CRUDRepository<PhoneAttribute>>;
    fn phone_labels(&self) -> Arc<CRUDRepository<PhoneLabel>>;
    fn phone_types(&self) -> Arc<CRUDRepository<PhoneType>>;
    fn resources(&self) -> Arc<CRUDRepository<Resource>>;
    fn reviews(&self) -> Arc<CRUDRepository<Review>>;
    fn roles(&self) -> Arc<CRUDRepository<Role>>;
    fn users(&self) -> Arc<CRUDRepository<User>>;
    fn user_groups(&self) -> Arc<CRUDRepository<UserGroup>>;
    fn user_roles(&self) -> Arc<CRUDRepository<UserRole>>;
    fn user_settings(&self) -> Arc<CRUDRepository<UserSetting>>;
}

impl Repositories for Arc<dyn Datasource> {
    fn addresses(&self) -> Arc<CRUDRepository<Address>> {
        Arc::new(super::addressesRepository::addresses_repository(self.bind_connection(None)).expect("addresses"))
    }
    fn address_attributes(&self) -> Arc<CRUDRepository<AddressAttribute>> {
        Arc::new(super::addressAttributesRepository::address_attributes_repository(self.bind_connection(None)).expect("address_attributes"))
    }
    fn address_labels(&self) -> Arc<CRUDRepository<AddressLabel>> {
        Arc::new(super::addressLabelsRepository::address_labels_repository(self.bind_connection(None)).expect("address_labels"))
    }
    fn address_types(&self) -> Arc<CRUDRepository<AddressType>> {
        Arc::new(super::addressTypesRepository::address_types_repository(self.bind_connection(None)).expect("address_types"))
    }
    fn categories(&self) -> Arc<CRUDRepository<Category>> {
        Arc::new(super::categoriesRepository::categories_repository(self.bind_connection(None)).expect("categories"))
    }
    fn contacts(&self) -> Arc<CRUDRepository<Contact>> {
        Arc::new(super::contactsRepository::contacts_repository(self.bind_connection(None)).expect("contacts"))
    }
    fn contact_attributes(&self) -> Arc<CRUDRepository<ContactAttribute>> {
        Arc::new(super::contactAttributesRepository::contact_attributes_repository(self.bind_connection(None)).expect("contact_attributes"))
    }
    fn contact_labels(&self) -> Arc<CRUDRepository<ContactLabel>> {
        Arc::new(super::contactLabelsRepository::contact_labels_repository(self.bind_connection(None)).expect("contact_labels"))
    }
    fn emails(&self) -> Arc<CRUDRepository<Email>> {
        Arc::new(super::emailsRepository::emails_repository(self.bind_connection(None)).expect("emails"))
    }
    fn email_attributes(&self) -> Arc<CRUDRepository<EmailAttribute>> {
        Arc::new(super::emailAttributesRepository::email_attributes_repository(self.bind_connection(None)).expect("email_attributes"))
    }
    fn email_labels(&self) -> Arc<CRUDRepository<EmailLabel>> {
        Arc::new(super::emailLabelsRepository::email_labels_repository(self.bind_connection(None)).expect("email_labels"))
    }
    fn email_types(&self) -> Arc<CRUDRepository<EmailType>> {
        Arc::new(super::emailTypesRepository::email_types_repository(self.bind_connection(None)).expect("email_types"))
    }
    fn games(&self) -> Arc<CRUDRepository<Game>> {
        Arc::new(super::gamesRepository::games_repository(self.bind_connection(None)).expect("games"))
    }
    fn game_categories(&self) -> Arc<CRUDRepository<GameCategory>> {
        Arc::new(super::gameCategoriesRepository::game_categories_repository(self.bind_connection(None)).expect("game_categories"))
    }
    fn game_parents(&self) -> Arc<CRUDRepository<GameParent>> {
        Arc::new(super::gameParentsRepository::game_parents_repository(self.bind_connection(None)).expect("game_parents"))
    }
    fn game_parent_categories(&self) -> Arc<CRUDRepository<GameParentCategory>> {
        Arc::new(super::gameParentCategoriesRepository::game_parent_categories_repository(self.bind_connection(None)).expect("game_parent_categories"))
    }
    fn game_parent_configs(&self) -> Arc<CRUDRepository<GameParentConfig>> {
        Arc::new(super::gameParentConfigsRepository::game_parent_configs_repository(self.bind_connection(None)).expect("game_parent_configs"))
    }
    fn game_parent_settings(&self) -> Arc<CRUDRepository<GameParentSetting>> {
        Arc::new(super::gameParentSettingsRepository::game_parent_settings_repository(self.bind_connection(None)).expect("game_parent_settings"))
    }
    fn game_settings(&self) -> Arc<CRUDRepository<GameSetting>> {
        Arc::new(super::gameSettingsRepository::game_settings_repository(self.bind_connection(None)).expect("game_settings"))
    }
    fn game_states(&self) -> Arc<CRUDRepository<GameState>> {
        Arc::new(super::gameStatesRepository::game_states_repository(self.bind_connection(None)).expect("game_states"))
    }
    fn genders(&self) -> Arc<CRUDRepository<Gender>> {
        Arc::new(super::gendersRepository::genders_repository(self.bind_connection(None)).expect("genders"))
    }
    fn groups(&self) -> Arc<CRUDRepository<Group>> {
        Arc::new(super::groupsRepository::groups_repository(self.bind_connection(None)).expect("groups"))
    }
    fn labels(&self) -> Arc<CRUDRepository<Label>> {
        Arc::new(super::labelsRepository::labels_repository(self.bind_connection(None)).expect("labels"))
    }
    fn languages(&self) -> Arc<CRUDRepository<Language>> {
        Arc::new(super::languagesRepository::languages_repository(self.bind_connection(None)).expect("languages"))
    }
    fn localized_strings(&self) -> Arc<CRUDRepository<LocalizedString>> {
        Arc::new(super::localizedStringsRepository::localized_strings_repository(self.bind_connection(None)).expect("localized_strings"))
    }
    fn localized_string_names(&self) -> Arc<CRUDRepository<LocalizedStringName>> {
        Arc::new(super::localizedStringNamesRepository::localized_string_names_repository(self.bind_connection(None)).expect("localized_string_names"))
    }
    fn mime_types(&self) -> Arc<CRUDRepository<MimeType>> {
        Arc::new(super::mimeTypesRepository::mime_types_repository(self.bind_connection(None)).expect("mime_types"))
    }
    fn phones(&self) -> Arc<CRUDRepository<Phone>> {
        Arc::new(super::phonesRepository::phones_repository(self.bind_connection(None)).expect("phones"))
    }
    fn phone_attributes(&self) -> Arc<CRUDRepository<PhoneAttribute>> {
        Arc::new(super::phoneAttributesRepository::phone_attributes_repository(self.bind_connection(None)).expect("phone_attributes"))
    }
    fn phone_labels(&self) -> Arc<CRUDRepository<PhoneLabel>> {
        Arc::new(super::phoneLabelsRepository::phone_labels_repository(self.bind_connection(None)).expect("phone_labels"))
    }
    fn phone_types(&self) -> Arc<CRUDRepository<PhoneType>> {
        Arc::new(super::phoneTypesRepository::phone_types_repository(self.bind_connection(None)).expect("phone_types"))
    }
    fn resources(&self) -> Arc<CRUDRepository<Resource>> {
        Arc::new(super::resourcesRepository::resources_repository(self.bind_connection(None)).expect("resources"))
    }
    fn reviews(&self) -> Arc<CRUDRepository<Review>> {
        Arc::new(super::reviewsRepository::reviews_repository(self.bind_connection(None)).expect("reviews"))
    }
    fn roles(&self) -> Arc<CRUDRepository<Role>> {
        Arc::new(super::rolesRepository::roles_repository(self.bind_connection(None)).expect("roles"))
    }
    fn users(&self) -> Arc<CRUDRepository<User>> {
        Arc::new(super::usersRepository::users_repository(self.bind_connection(None)).expect("users"))
    }
    fn user_groups(&self) -> Arc<CRUDRepository<UserGroup>> {
        Arc::new(super::userGroupsRepository::user_groups_repository(self.bind_connection(None)).expect("user_groups"))
    }
    fn user_roles(&self) -> Arc<CRUDRepository<UserRole>> {
        Arc::new(super::userRolesRepository::user_roles_repository(self.bind_connection(None)).expect("user_roles"))
    }
    fn user_settings(&self) -> Arc<CRUDRepository<UserSetting>> {
        Arc::new(super::userSettingsRepository::user_settings_repository(self.bind_connection(None)).expect("user_settings"))
    }
}
